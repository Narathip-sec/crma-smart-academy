// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

import { createAdminAuditExportHandler } from '@/app/api/admin/audit/export/handler'

import type { Role } from '@prisma/client'

function build(
  opts: {
    url?: string
    userId?: string | null
    role?: Role | null
  } = {},
) {
  const headers: Record<string, string> = {}
  if (opts.userId) headers['x-user-id'] = opts.userId
  if (opts.role) headers['x-user-role'] = opts.role
  return new NextRequest(new URL(opts.url ?? 'http://localhost/api/admin/audit/export'), {
    method: 'GET',
    headers,
  })
}

function fakeRow(overrides: Partial<{ id: string; action: string; metadata: unknown }> = {}) {
  return {
    id: 'log_1',
    userId: 'user_1',
    action: 'AUTH:line_callback',
    resource: 'user:user_1',
    result: 'ALLOW',
    ip: '127.0.0.1',
    userAgent: 'LINE/13',
    metadata: { branch: 'ok' },
    createdAt: new Date('2026-05-19T10:00:00Z'),
    ...overrides,
  }
}

function setup(opts?: { rows?: ReturnType<typeof fakeRow>[] }) {
  const rows = opts?.rows ?? [fakeRow(), fakeRow({ id: 'log_2', action: 'WRITE:roster' })]
  const audit = vi.fn().mockResolvedValue(undefined)
  const prisma = {
    auditLog: {
      findMany: vi.fn().mockResolvedValue(rows),
    },
  }
  const handler = createAdminAuditExportHandler({ prisma: prisma as never, audit })
  return { audit, handler, prisma }
}

describe('GET /api/admin/audit/export — auth + RBAC gates', () => {
  test('401 + audit DENY when x-user-id missing', async () => {
    const { audit, handler, prisma } = setup()
    const res = await handler(build({ role: 'ADMIN' }))
    expect(res.status).toBe(401)
    expect(prisma.auditLog.findMany).not.toHaveBeenCalled()
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ADMIN:audit_export', result: 'DENY' }),
    )
  })

  test('403 + audit DENY when caller is not ADMIN', async () => {
    const { audit, handler, prisma } = setup()
    const res = await handler(build({ userId: 'user_1', role: 'OFFICER' }))
    expect(res.status).toBe(403)
    expect(prisma.auditLog.findMany).not.toHaveBeenCalled()
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ADMIN:audit_export',
        result: 'DENY',
        metadata: expect.objectContaining({ reason: 'forbidden', role: 'OFFICER' }),
      }),
    )
  })
})

describe('GET /api/admin/audit/export — happy path', () => {
  test('200 returns CSV with header row + one row per AuditLog', async () => {
    const { audit, handler } = setup()
    const res = await handler(build({ userId: 'admin_1', role: 'ADMIN' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/csv')
    expect(res.headers.get('content-disposition')).toContain('crma-audit-')

    const csv = await res.text()
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('id,createdAt,userId,action,resource,result,ip,userAgent,metadata')
    expect(lines).toHaveLength(3) // header + 2 rows
    expect(lines[1]).toContain('log_1')
    expect(lines[2]).toContain('log_2')

    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ADMIN:audit_export',
        result: 'ALLOW',
        metadata: expect.objectContaining({ rowCount: 2 }),
      }),
    )
  })

  test('parses ?from + ?to date bounds into createdAt window', async () => {
    const { handler, prisma } = setup()
    const url = 'http://localhost/api/admin/audit/export?from=2026-05-01&to=2026-05-20'
    await handler(build({ url, userId: 'admin_1', role: 'ADMIN' }))

    const arg = (prisma.auditLog.findMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      where: { createdAt: { gte: Date; lte: Date } }
    }
    expect(arg.where.createdAt.gte.toISOString()).toBe('2026-05-01T00:00:00.000Z')
    expect(arg.where.createdAt.lte.toISOString()).toBe('2026-05-20T23:59:59.999Z')
  })

  test('ignores malformed ?from (skips bound, does not 500)', async () => {
    const { handler, prisma } = setup()
    const url = 'http://localhost/api/admin/audit/export?from=garbage'
    const res = await handler(build({ url, userId: 'admin_1', role: 'ADMIN' }))
    expect(res.status).toBe(200)
    const arg = (prisma.auditLog.findMany as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      where: object
    }
    expect(arg.where).toEqual({})
  })

  test('clamps ?limit to maxLimit', async () => {
    const audit = vi.fn().mockResolvedValue(undefined)
    const prisma = {
      auditLog: { findMany: vi.fn().mockResolvedValue([]) },
    }
    const handler = createAdminAuditExportHandler({
      prisma: prisma as never,
      audit,
      defaultLimit: 100,
      maxLimit: 500,
    })
    const url = 'http://localhost/api/admin/audit/export?limit=999999'
    await handler(build({ url, userId: 'admin_1', role: 'ADMIN' }))
    const arg = prisma.auditLog.findMany.mock.calls[0]?.[0] as { take: number }
    expect(arg.take).toBe(500)
  })

  test('CSV escapes embedded commas / quotes / newlines in metadata', async () => {
    const tricky = fakeRow({
      id: 'log_x',
      metadata: { note: 'has "quotes", commas, and\nnewlines' },
    })
    const { handler } = setup({ rows: [tricky] })
    const res = await handler(build({ userId: 'admin_1', role: 'ADMIN' }))
    const csv = await res.text()
    // JSON-serialised metadata gets wrapped in double quotes because it
    // contains commas / quotes / newlines; embedded quotes are doubled
    // by the CSV escape pass even though the inner JSON also contains
    // backslash-escaped quotes from JSON.stringify.
    expect(csv).toContain('""')
    // Row must be enclosed in surrounding quotes when metadata contains
    // CSV-special characters.
    expect(csv).toMatch(/,"\{""note""/)
  })
})
