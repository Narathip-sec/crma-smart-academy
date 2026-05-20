// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createTotpStartHandler } from '@/app/api/auth/totp/enrol/start/handler'
import { ENROL_COOKIE, signEnrolToken, type EnrolPayload } from '@/lib/session'

const ENROL: EnrolPayload = {
  sub: 'user_1',
  lineUserId: 'U_line',
  deviceFp: 'devfp',
}

type FakeUser = {
  id: string
  cadetId: string
  totpSecret: string | null
  totpVerified: Date | null
}

function setup(opts?: { user?: Partial<FakeUser> | null }) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const baseUser: FakeUser =
    opts?.user === null
      ? (null as never)
      : {
          id: ENROL.sub,
          cadetId: 'CDT-2568-001',
          totpSecret: null,
          totpVerified: null,
          ...opts?.user,
        }

  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (opts?.user === null) return null
        if (where.id !== baseUser.id) return null
        return baseUser
      }),
      update: vi.fn(async ({ data }: { data: Partial<FakeUser> }) => {
        Object.assign(baseUser, data)
        return baseUser
      }),
    },
  }

  const encrypt = vi.fn(async (plain: string) => `ct:${plain}`)
  const generateSecret = vi.fn(() => 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP')
  const buildOtpAuthUri = vi.fn(
    ({ secret, account }: { secret: string; account: string }) =>
      `otpauth://totp/CRMA%20Smart%20Academy:${account}?secret=${secret}`,
  )
  const buildQrDataUrl = vi.fn(async () => 'data:image/png;base64,FAKE')

  const handler = createTotpStartHandler({
    prisma: prisma as never,
    verifyEnrolToken: (async (t: string) => {
      if (t === 'invalid') throw new Error('bad token')
      return ENROL
    }) as never,
    encrypt: encrypt as never,
    generateSecret: generateSecret as never,
    buildOtpAuthUri: buildOtpAuthUri as never,
    buildQrDataUrl: buildQrDataUrl as never,
    audit,
  })
  return {
    handler,
    prisma,
    audit,
    encrypt,
    generateSecret,
    buildOtpAuthUri,
    buildQrDataUrl,
    baseUser,
  }
}

async function postWithCookie(cookie?: string) {
  const req = new NextRequest(new URL('http://localhost/api/auth/totp/enrol/start'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (cookie) req.cookies.set(ENROL_COOKIE, cookie)
  return req
}

beforeEach(() => {
  process.env.HMAC_KEY = 'IBshHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs'
  process.env.ENCRYPTION_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8'
})

describe('POST /api/auth/totp/enrol/start — enrol cookie gate', () => {
  test('missing cookie → 401 enrol_required', async () => {
    const { handler, audit } = setup()
    const res = await handler(await postWithCookie())
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('enrol_required')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'DENY' }))
  })

  test('invalid cookie → 401 enrol_invalid', async () => {
    const { handler } = setup()
    const res = await handler(await postWithCookie('invalid'))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('enrol_invalid')
  })
})

describe('POST /api/auth/totp/enrol/start — user state', () => {
  test('user not in DB → 404 user_missing', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup({ user: null })
    const res = await handler(await postWithCookie(token))
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('user_missing')
  })

  test('totpVerified already set → 409 already_enrolled', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, audit } = setup({ user: { totpVerified: new Date() } })
    const res = await handler(await postWithCookie(token))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('already_enrolled')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { reason: 'already_enrolled' } }),
    )
  })
})

describe('POST /api/auth/totp/enrol/start — happy path', () => {
  test('persists ciphertext, returns URI + QR, audits ALLOW', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, prisma, audit, encrypt, generateSecret, baseUser } = setup()
    const res = await handler(await postWithCookie(token))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.otpAuthUri).toMatch(/^otpauth:\/\/totp\//)
    expect(body.qrDataUrl.startsWith('data:image/png;base64,')).toBe(true)

    expect(generateSecret).toHaveBeenCalledTimes(1)
    expect(encrypt).toHaveBeenCalledTimes(1)
    expect(prisma.user.update).toHaveBeenCalledTimes(1)
    const upd = prisma.user.update.mock.calls[0]?.[0] as {
      where: { id: string }
      data: { totpSecret: string }
    }
    expect(upd.where.id).toBe(ENROL.sub)
    // Plaintext never persisted — what lands on the row is the encrypt() result.
    expect(upd.data.totpSecret.startsWith('ct:')).toBe(true)
    expect(baseUser.totpSecret).toBe(upd.data.totpSecret)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ALLOW' }))
  })

  test('URI carries the cadet ID (not the email)', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, buildOtpAuthUri } = setup({ user: { cadetId: 'CDT-OK' } })
    await handler(await postWithCookie(token))
    expect(buildOtpAuthUri).toHaveBeenCalledTimes(1)
    const arg = buildOtpAuthUri.mock.calls[0]?.[0] as { account: string }
    expect(arg.account).toBe('CDT-OK')
  })
})
