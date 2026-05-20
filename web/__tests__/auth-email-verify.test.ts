// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createEmailVerifyHandler } from '@/app/api/auth/email/verify/handler'
import { hashCode } from '@/lib/email-otp'
import { ENROL_COOKIE, signEnrolToken, type EnrolPayload } from '@/lib/session'

const ENROL: EnrolPayload = {
  sub: 'user_1',
  lineUserId: 'U_line',
  deviceFp: 'devfp',
}

type OtpRow = {
  id: string
  userId: string
  codeHash: string
  emailHash: string
  emailCiphertext: string
  expiresAt: Date
  attempts: number
  consumedAt: Date | null
  createdAt: Date
}

function setup(opts?: { row?: Partial<OtpRow>; userTotpSecret?: string | null }) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const rows: OtpRow[] = []
  if (opts?.row) {
    rows.push({
      id: 'otp_1',
      userId: ENROL.sub,
      codeHash: 'placeholder',
      emailHash: 'hash_a',
      emailCiphertext: 'ct_a',
      expiresAt: new Date(Date.now() + 600_000),
      attempts: 0,
      consumedAt: null,
      createdAt: new Date(),
      ...opts.row,
    })
  }
  const userTotpSecret = opts?.userTotpSecret ?? null

  const prisma = {
    user: {
      update: vi.fn(async ({ data }: { data: Partial<{ emailHash: string }> }) => ({
        id: ENROL.sub,
        totpSecret: userTotpSecret,
        ...data,
      })),
    },
    emailOtp: {
      create: vi.fn(),
      findFirst: vi.fn(async ({ where }: { where: { userId: string; consumedAt?: null } }) => {
        return (
          rows.find((r) => {
            if (r.userId !== where.userId) return false
            if (where.consumedAt === null && r.consumedAt !== null) return false
            return true
          }) ?? null
        )
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<OtpRow> }) => {
        const row = rows.find((r) => r.id === where.id)
        if (row) Object.assign(row, data)
        return row
      }),
    },
  }

  const handler = createEmailVerifyHandler({
    prisma: prisma as never,
    verifyEnrolToken: (async (t: string) => {
      if (t === 'invalid') throw new Error('bad token')
      return ENROL
    }) as never,
    audit,
  })
  return { handler, prisma, audit, rows }
}

async function postWithCookie(body: unknown, cookie?: string) {
  const req = new NextRequest(new URL('http://localhost/api/auth/email/verify'), {
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

describe('POST /api/auth/email/verify — enrol cookie gate', () => {
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

describe('POST /api/auth/email/verify — body validation', () => {
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

describe('POST /api/auth/email/verify — OTP outcomes', () => {
  test('no row → 404 not_found', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup()
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(404)
    expect((await res.json()).error).toBe('not_found')
  })

  test('expired row → 410 expired', async () => {
    const token = await signEnrolToken(ENROL)
    const correctHash = await hashCode('123456')
    const { handler } = setup({
      row: { codeHash: correctHash, expiresAt: new Date(Date.now() - 1000) },
    })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(410)
    expect((await res.json()).error).toBe('expired')
  })

  test('wrong code → 401 mismatch', async () => {
    const token = await signEnrolToken(ENROL)
    const correctHash = await hashCode('123456')
    const { handler, rows } = setup({ row: { codeHash: correctHash } })
    const res = await handler(await postWithCookie({ code: '000000' }, token))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('mismatch')
    expect(rows[0]?.attempts).toBe(1)
  })

  test('5th wrong → 429 attempts_exceeded', async () => {
    const token = await signEnrolToken(ENROL)
    const correctHash = await hashCode('123456')
    const { handler } = setup({ row: { codeHash: correctHash, attempts: 4 } })
    const res = await handler(await postWithCookie({ code: '000000' }, token))
    expect(res.status).toBe(429)
    expect((await res.json()).error).toBe('attempts_exceeded')
  })
})

describe('POST /api/auth/email/verify — happy paths', () => {
  test('match without totp → 200 needs_totp + user updated', async () => {
    const token = await signEnrolToken(ENROL)
    const correctHash = await hashCode('123456')
    const { handler, prisma, audit } = setup({
      row: { codeHash: correctHash, emailHash: 'final_hash', emailCiphertext: 'final_ct' },
    })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('needs_totp')

    expect(prisma.user.update).toHaveBeenCalledTimes(1)
    const upd = prisma.user.update.mock.calls[0]?.[0] as {
      where: { id: string }
      data: { emailHash: string; emailCiphertext: string; emailVerified: Date }
    }
    expect(upd.where.id).toBe(ENROL.sub)
    expect(upd.data.emailHash).toBe('final_hash')
    expect(upd.data.emailCiphertext).toBe('final_ct')
    expect(upd.data.emailVerified).toBeInstanceOf(Date)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ALLOW' }))
  })

  test('match with existing totp → 200 ok', async () => {
    const token = await signEnrolToken(ENROL)
    const correctHash = await hashCode('123456')
    const { handler } = setup({
      row: { codeHash: correctHash },
      userTotpSecret: 'already-enrolled-secret',
    })
    const res = await handler(await postWithCookie({ code: '123456' }, token))
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('ok')
  })
})
