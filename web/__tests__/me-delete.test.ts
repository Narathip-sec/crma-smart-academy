// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

import { createMeDeleteHandler } from '@/app/api/me/delete/handler'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/session'

function build(userId?: string | null) {
  const headers: Record<string, string> = {}
  if (userId) headers['x-user-id'] = userId
  return new NextRequest(new URL('http://localhost/api/me/delete'), {
    method: 'POST',
    headers,
  })
}

function setup(opts?: { revokedCount?: number }) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const prisma = {
    refreshToken: {
      updateMany: vi.fn().mockResolvedValue({ count: opts?.revokedCount ?? 3 }),
    },
  }
  const handler = createMeDeleteHandler({
    prisma: prisma as never,
    audit,
    now: () => new Date('2026-05-20T10:00:00Z'),
  })
  return { audit, handler, prisma }
}

describe('POST /api/me/delete — auth gate', () => {
  test('401 + audit DENY when x-user-id missing', async () => {
    const { audit, handler, prisma } = setup()
    const res = await handler(build())
    expect(res.status).toBe(401)
    expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled()
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PDPA:delete_sessions', result: 'DENY' }),
    )
  })
})

describe('POST /api/me/delete — happy path', () => {
  test('200 revokes all live RefreshTokens for caller', async () => {
    const { handler, prisma } = setup({ revokedCount: 4 })
    const res = await handler(build('user_1'))
    expect(res.status).toBe(200)

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user_1', revokedAt: null },
      data: { revokedAt: new Date('2026-05-20T10:00:00Z') },
    })

    const body = (await res.json()) as { ok: boolean; revokedCount: number }
    expect(body).toEqual({ ok: true, revokedCount: 4 })
  })

  test('200 clears access + refresh cookies (Max-Age=0)', async () => {
    const { handler } = setup()
    const res = await handler(build('user_1'))
    const cookies = res.headers.getSetCookie()
    const access = cookies.find((c) => c.startsWith(`${ACCESS_COOKIE}=`))
    const refresh = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE}=`))
    expect(access).toBeDefined()
    expect(refresh).toBeDefined()
    expect(access).toContain('Max-Age=0')
    expect(refresh).toContain('Max-Age=0')
  })

  test('writes one audit row with revokedCount', async () => {
    const { audit, handler } = setup({ revokedCount: 2 })
    await handler(build('user_1'))
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        action: 'PDPA:delete_sessions',
        result: 'ALLOW',
        metadata: expect.objectContaining({ revokedCount: 2 }),
      }),
    )
  })
})
