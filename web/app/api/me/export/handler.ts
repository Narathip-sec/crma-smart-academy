// Phase 10 — PDPA self-service export.
//
// Returns the cadet's PII bundle as JSON: the User row (with the
// decrypted email substituted in for emailCiphertext) and every
// AuditLog row keyed to the cadet's userId. The endpoint is gated by
// the standard cookie middleware (req.headers['x-user-id'] is set by
// `attachUser` for any authenticated request) and a fresh AuditLog
// row is written every time someone downloads their data.
//
// Hard-delete + cascade is not implemented yet — that requires a
// schema migration adding `deletedAt` and a scheduled hard-delete job.
// See app/api/me/delete/handler.ts which revokes all RefreshToken rows.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { decrypt as defaultDecrypt } from '@/lib/crypto'
import { prisma as defaultPrisma } from '@/lib/prisma'

import type { PrismaClient } from '@prisma/client'

export interface MeExportDeps {
  prisma: Pick<PrismaClient, 'user' | 'auditLog'>
  audit: typeof defaultAudit
  decrypt: typeof defaultDecrypt
}

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

export function createMeExportHandler(deps: MeExportDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      await deps.audit({
        userId: null,
        action: 'PDPA:export',
        resource: 'me:export',
        result: 'DENY',
        ip,
        userAgent,
      })
      return jsonResponse(401, { error: 'unauthorized' })
    }

    const user = await deps.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      await deps.audit({
        userId,
        action: 'PDPA:export',
        resource: `user:${userId}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'user_not_found' },
      })
      return jsonResponse(404, { error: 'not_found' })
    }

    // Decrypt email if present. If decryption fails (key rotated, etc.)
    // we still ship the bundle so the cadet can see the audit log; the
    // email field is set to null with a reason in the bundle metadata.
    let email: string | null = null
    let emailDecryptError: string | null = null
    if (user.emailCiphertext) {
      try {
        email = await deps.decrypt(user.emailCiphertext)
      } catch (err) {
        emailDecryptError = err instanceof Error ? err.message : 'decrypt_failed'
      }
    }

    const auditLogs = await deps.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const bundle = {
      generatedAt: new Date().toISOString(),
      user: {
        id: user.id,
        cadetId: user.cadetId,
        email,
        emailDecryptError,
        emailVerifiedAt: user.emailVerified?.toISOString() ?? null,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        company: user.company,
        year: user.year,
        totpEnrolled: Boolean(user.totpVerified),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      auditLogs: auditLogs.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        action: row.action,
        resource: row.resource,
        result: row.result,
        ip: row.ip,
        userAgent: row.userAgent,
        metadata: row.metadata,
      })),
    }

    await deps.audit({
      userId,
      action: 'PDPA:export',
      resource: `user:${userId}`,
      result: 'ALLOW',
      ip,
      userAgent,
      metadata: { auditRowCount: auditLogs.length },
    })

    const filename = `crma-export-${user.cadetId}-${new Date().toISOString().slice(0, 10)}.json`
    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
        'cache-control': 'no-store',
      },
    })
  }
}

export const defaultMeExportHandler = createMeExportHandler({
  prisma: defaultPrisma,
  audit: defaultAudit,
  decrypt: defaultDecrypt,
})
