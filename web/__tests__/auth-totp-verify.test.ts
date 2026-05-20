// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createTotpVerifyHandler } from '@/app/api/auth/totp/enrol/verify/handler'
import {
  ACCESS_COOKIE,
  ENROL_COOKIE,
  REFRESH_COOKIE,
  signEnrolToken,
  type EnrolPayload,
} from '@/lib/session'

const ENROL: EnrolPayload = {
  sub: 'user_1',
  lineUserId: 'U_line',
  deviceFp: 'devfp_test',
}

type FakeUser = {
  id: string
  cadetId: string
  role: 'CADET'
  totpSecret: string | null
  totpVerified: Date | null
}

function setup(opts?: {
  user?: Partial<FakeUser> | null
  verifyCodeResult?: boolean
  decryptThrows?: boolean
}) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const baseUser: FakeUser =
    opts?.user === null
      ? (null as never)
      : {
          id: ENROL.sub,
          cadetId: 'CDT-2568-001',
          role: 'CADET',
          totpSecret: 'ct:JBSWY3DPEHPK3PXP',
          totpVerified: null,
          ...opts?.user,
        }

  const prisma = {
    user: {
      findUnique: vi.fn(async () => (opts?.user === null ? null : baseUser)),
      update: vi.fn(async ({ data }: { data: Partial<FakeUser> }) => {
        Object.assign(baseUser, data)
        return baseUser
      }),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue({ id: 'rt_1' }),
    },
  }

  const decrypt = vi.fn(async (ct: string) => {
    if (opts?.decryptThrows) throw new Error('boom')
    return ct.replace(/^ct:/, '')
  })
  const verifyCode = vi.fn(() => opts?.verifyCodeResult ?? true)

  const handler = createTotpVerifyHandler({
    prisma: prisma as never,
    verifyEnrolToken: (async (t: string) => {
      if (t === 'invalid') throw new Error('bad token')
      return ENROL
    }) as never,
    decrypt: decrypt as never,
    verifyCode: verifyCode as never,
    audit,
  })
  return { handler, prisma, audit, decrypt, verifyCode, baseUser }
}

async function postWithCookie(body: unknown, cookie?: string) {
  const req = new NextRequest(new URL('http://localhost/api/auth/totp/enrol/verify'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (cookie) req.cookies.set(ENROL_COOKIE, cookie)
  return req
}

beforeEach(() => {
  process.env.HMAC_KEY = 'IBshHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs'
  process.env.ENCRYPTION_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8'
})

describe('POST /api/auth/totp/enrol/verify — enrol cookie gate', () => {
  test('missing cookie → 401 enrol_required', async () => {
    const { handler, audit } = setup()
    const res = await handler(await postWithCookie({ code: '123456' }))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('enrol_required')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'DENY' }))
  })

  test('invalid cookie → 401 enrol_invalid', async () => {
    const { handler } = setup()
    const res = await handler(await postWithCookie({ code: '123456' }, 'invalid'))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('enrol_invalid')
  })
})

describe('POST /api/auth/totp/enrol/verify — body validation', () => {
  test('missing code → 400 bad_code', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup()
    const res = await handler(await postWithCookie({}, token))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('bad_code')
  })

  test('non-digit code → 400 bad_code', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup()
    const res = await handler(await postWithCookie({ code: 'abcdef' }, token))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/totp/enrol/verify — enrol state', () => {
  test('user missing → 409 enrol_not_started', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup({ user: null })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('enrol_not_started')
  })

  test('user.totpSecret null → 409 enrol_not_started', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup({ user: { totpSecret: null } })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('enrol_not_started')
  })
})

describe('POST /api/auth/totp/enrol/verify — code outcomes', () => {
  test('verifyCode returns false → 401 invalid_code (no totpVerified stamp, no cookies)', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, prisma, baseUser } = setup({ verifyCodeResult: false })
    const res = await handler(await postWithCookie({ code: '000000' }, token))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('invalid_code')
    expect(prisma.user.update).not.toHaveBeenCalled()
    expect(prisma.refreshToken.create).not.toHaveBeenCalled()
    expect(baseUser.totpVerified).toBeNull()
    expect(res.headers.get('set-cookie')).toBeFalsy()
  })

  test('decrypt throws → 500 decrypt_failed + audit ERROR', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, audit } = setup({ decryptThrows: true })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('decrypt_failed')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ERROR' }))
  })
})

describe('POST /api/auth/totp/enrol/verify — happy path', () => {
  test('valid code → 200 ok + totpVerified stamped + cookies minted + enrol cleared', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, prisma, audit, decrypt, verifyCode, baseUser } = setup()
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('ok')

    expect(decrypt).toHaveBeenCalledTimes(1)
    expect(verifyCode).toHaveBeenCalledTimes(1)
    expect(prisma.user.update).toHaveBeenCalledTimes(1)
    expect(baseUser.totpVerified).toBeInstanceOf(Date)

    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1)
    const rt = prisma.refreshToken.create.mock.calls[0]?.[0] as {
      data: { userId: string; tokenHash: string; deviceFp: string; expiresAt: Date }
    }
    expect(rt.data.userId).toBe('user_1')
    expect(rt.data.deviceFp).toBe('devfp_test')
    expect(typeof rt.data.tokenHash).toBe('string')
    expect(rt.data.expiresAt).toBeInstanceOf(Date)

    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=`)
    expect(setCookie).toContain(`${REFRESH_COOKIE}=`)
    // Cleared enrol cookie present as Max-Age=0
    expect(setCookie).toContain(`${ENROL_COOKIE}=;`)
    expect(setCookie).toMatch(/Max-Age=0/)

    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ALLOW' }))
  })
})
