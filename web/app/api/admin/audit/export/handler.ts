// Phase 10 — ADMIN-only audit log export as CSV.
//
// Required for compliance reviews + post-incident forensics. The
// middleware attaches x-user-id + x-user-role headers to authenticated
// requests; only Role=ADMIN can pass the gate (lib/rbac.canExportAudit).
//
// Query params (all optional):
//   ?from=YYYY-MM-DD        inclusive lower bound on createdAt
//   ?to=YYYY-MM-DD          inclusive upper bound on createdAt (end of day)
//   ?limit=NNN              max rows (default 10_000, hard cap 50_000)
//
// CSV header order is stable so downstream tooling can map columns.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { prisma as defaultPrisma } from '@/lib/prisma'
import { canExportAudit } from '@/lib/rbac'

import type { AuditLog, PrismaClient, Role } from '@prisma/client'

export interface AdminAuditExportDeps {
  prisma: Pick<PrismaClient, 'auditLog'>
  audit: typeof defaultAudit
  defaultLimit?: number
  maxLimit?: number
}

const DEFAULT_LIMIT = 10_000
const MAX_LIMIT = 50_000

const CSV_HEADERS = [
  'id',
  'createdAt',
  'userId',
  'action',
  'resource',
  'result',
  'ip',
  'userAgent',
  'metadata',
] as const

function reqHeaders(req: NextRequest) {
  return {
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null,
    userAgent: req.headers.get('user-agent') ?? null,
  }
}

function jsonResponse(status: number, body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (/["\n\r,]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function rowsToCsv(rows: ReadonlyArray<AuditLog>): string {
  const lines: string[] = [CSV_HEADERS.join(',')]
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.createdAt.toISOString()),
        csvCell(r.userId),
        csvCell(r.action),
        csvCell(r.resource),
        csvCell(r.result),
        csvCell(r.ip),
        csvCell(r.userAgent),
        csvCell(r.metadata),
      ].join(','),
    )
  }
  return lines.join('\r\n')
}

function parseDateBound(raw: string | null, endOfDay: boolean): Date | null {
  if (!raw) return null
  // Strict YYYY-MM-DD to defend against attacker-controlled query strings
  // that could otherwise smuggle JS Date parsing surprises.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const iso = endOfDay ? `${raw}T23:59:59.999Z` : `${raw}T00:00:00.000Z`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function createAdminAuditExportHandler(deps: AdminAuditExportDeps) {
  const defaultLimit = deps.defaultLimit ?? DEFAULT_LIMIT
  const maxLimit = deps.maxLimit ?? MAX_LIMIT

  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)
    const userId = req.headers.get('x-user-id')
    const role = req.headers.get('x-user-role') as Role | null

    if (!userId || !role) {
      await deps.audit({
        userId,
        action: 'ADMIN:audit_export',
        resource: 'admin:audit_export',
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'no_auth' },
      })
      return jsonResponse(401, { error: 'unauthorized' })
    }

    if (!canExportAudit(role)) {
      await deps.audit({
        userId,
        action: 'ADMIN:audit_export',
        resource: 'admin:audit_export',
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'forbidden', role },
      })
      return jsonResponse(403, { error: 'forbidden' })
    }

    const url = new URL(req.url)
    const from = parseDateBound(url.searchParams.get('from'), false)
    const to = parseDateBound(url.searchParams.get('to'), true)

    const rawLimit = Number.parseInt(url.searchParams.get('limit') ?? '', 10)
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, maxLimit) : defaultLimit

    const where: { createdAt?: { gte?: Date; lte?: Date } } = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = from
      if (to) where.createdAt.lte = to
    }

    const rows = await deps.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const csv = rowsToCsv(rows)

    await deps.audit({
      userId,
      action: 'ADMIN:audit_export',
      resource: 'admin:audit_export',
      result: 'ALLOW',
      ip,
      userAgent,
      metadata: {
        rowCount: rows.length,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
        limit,
      },
    })

    const filename = `crma-audit-${new Date().toISOString().slice(0, 10)}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
        'cache-control': 'no-store',
      },
    })
  }
}

export const defaultAdminAuditExportHandler = createAdminAuditExportHandler({
  prisma: defaultPrisma,
  audit: defaultAudit,
})
