// Phase 10 — PDPA right-to-be-forgotten step 1: session purge.
//
// POSTing here revokes every non-expired RefreshToken row for the
// caller, clears the access + refresh cookies, and writes an AuditLog
// row. The caller is signed out everywhere immediately.
//
// Hard-delete of the User row + cascaded data wipe requires a
// schema migration (deletedAt + scheduled cleanup job) and lands in
// Phase 10b. Keeping session purge as a separately auditable step
// matches the PDPA "withdraw consent vs. erase" distinction.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { prisma as defaultPrisma } from '@/lib/prisma'
import { clearAuthCookies } from '@/lib/session'

import type { PrismaClient } from '@prisma/client'

export interface MeDeleteDeps {
  prisma: Pick<PrismaClient, 'refreshToken'>
  audit: typeof defaultAudit
  now?: () => Date
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

export function createMeDeleteHandler(deps: MeDeleteDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      await deps.audit({
        userId: null,
        action: 'PDPA:delete_sessions',
        resource: 'me:delete',
        result: 'DENY',
        ip,
        userAgent,
      })
      return jsonResponse(401, { error: 'unauthorized' })
    }

    const now = deps.now?.() ?? new Date()
    const result = await deps.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    })

    await deps.audit({
      userId,
      action: 'PDPA:delete_sessions',
      resource: `user:${userId}`,
      result: 'ALLOW',
      ip,
      userAgent,
      metadata: { revokedCount: result.count },
    })

    const res = NextResponse.json({ ok: true, revokedCount: result.count })
    for (const cookie of clearAuthCookies()) {
      res.headers.append('set-cookie', cookie)
    }
    return res
  }
}

export const defaultMeDeleteHandler = createMeDeleteHandler({
  prisma: defaultPrisma,
  audit: defaultAudit,
})
