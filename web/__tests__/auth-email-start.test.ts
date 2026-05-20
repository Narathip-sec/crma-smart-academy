// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createEmailStartHandler } from '@/app/api/auth/email/start/handler'
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
  expiresAt: Date
  attempts: number
  consumedAt: Date | null
  createdAt: Date
}

function setup(opts?: {
  ownerEmailHash?: string
  ownerUserId?: string
  recentOtp?: Partial<OtpRow>
  send?: { ok: boolean; reason?: string }
}) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const rows: OtpRow[] = []
  if (opts?.recentOtp) {
    rows.push({
      id: 'otp_recent',
      userId: ENROL.sub,
      codeHash: 'h',
      emailHash: 'h',
      expiresAt: new Date(Date.now() + 600_000),
      attempts: 0,
      consumedAt: null,
      createdAt: new Date(),
      ...opts.recentOtp,
    })
  }

  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { emailHash?: string } }) => {
        if (opts?.ownerEmailHash && where.emailHash === opts.ownerEmailHash) {
          return { id: opts.ownerUserId ?? 'other_user' }
        }
        return null
      }),
    },
    emailOtp: {
      create: vi.fn(async ({ data }: { data: Omit<OtpRow, 'id' | 'createdAt'> }) => {
        const row: OtpRow = { id: `otp_${rows.length + 1}`, createdAt: new Date(), ...data }
        rows.unshift(row)
        return row
      }),
      findFirst: vi.fn(
        async ({
          where,
        }: {
          where: { userId: string; consumedAt?: null; createdAt?: { gt: Date } }
        }) => {
          return (
            rows.find((r) => {
              if (r.userId !== where.userId) return false
              if (where.consumedAt === null && r.consumedAt !== null) return false
              if (where.createdAt?.gt && !(r.createdAt > where.createdAt.gt)) return false
              return true
            }) ?? null
          )
        },
      ),
      update: vi.fn(),
    },
  }

  const send = vi.fn(async () => opts?.send ?? { ok: true as const })
  const handler = createEmailStartHandler({
    prisma: prisma as never,
    verifyEnrolToken: (async (t: string) => {
      if (t === 'invalid') throw new Error('bad token')
      return ENROL
    }) as never,
    sendOtpEmail: send as never,
    audit,
  })
  return { handler, prisma, audit, send, rows }
}

async function postWithCookie(body: unknown, cookie?: string) {
  const req = new NextRequest(new URL('http://localhost/api/auth/email/start'), {
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
  delete process.env.BREVO_API_KEY
})

describe('POST /api/auth/email/start — enrol cookie gate', () => {
  test('missing cookie → 401 enrol_required', async () => {
    const { handler, audit } = setup()
    const res = await handler(await postWithCookie({ email: 'a@crma.ac.th' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('enrol_required')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'DENY' }))
  })

  test('invalid cookie → 401 enrol_invalid', async () => {
    const { handler, audit } = setup()
    const res = await handler(await postWithCookie({ email: 'a@crma.ac.th' }, 'invalid'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('enrol_invalid')
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'DENY' }))
  })
})

describe('POST /api/auth/email/start — email validation', () => {
  test('non-crma.ac.th email → 400 bad_email', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, audit } = setup()
    const res = await handler(await postWithCookie({ email: 'cadet@gmail.com' }, token))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('bad_email')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'DENY', metadata: { reason: 'bad_email' } }),
    )
  })

  test('missing email field → 400 bad_email', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler } = setup()
    const res = await handler(await postWithCookie({}, token))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/email/start — conflict + rate-limit', () => {
  test('emailHash owned by another user → 409 email_in_use', async () => {
    const token = await signEnrolToken(ENROL)
    const { hmacEmail, normaliseEmail } = await import('@/lib/crypto')
    const ownerHash = await hmacEmail(normaliseEmail('cadet@crma.ac.th'))
    const { handler, audit } = setup({ ownerEmailHash: ownerHash, ownerUserId: 'someone_else' })
    const res = await handler(await postWithCookie({ email: 'cadet@crma.ac.th' }, token))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('email_in_use')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { reason: 'email_in_use' } }),
    )
  })

  test('recent OTP within 60s → 429 rate_limited', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, audit } = setup({ recentOtp: { createdAt: new Date() } })
    const res = await handler(await postWithCookie({ email: 'cadet@crma.ac.th' }, token))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBe('rate_limited')
    expect(typeof body.retryAt).toBe('string')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { reason: 'rate_limited' } }),
    )
  })
})

describe('POST /api/auth/email/start — happy path', () => {
  test('valid request → 200 ok + OTP row created + send called', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, prisma, audit, send, rows } = setup()
    const res = await handler(await postWithCookie({ email: 'CADET@crma.AC.th' }, token))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(typeof body.expiresAt).toBe('string')

    expect(prisma.emailOtp.create).toHaveBeenCalledTimes(1)
    expect(rows[0]?.userId).toBe('user_1')
    expect(send).toHaveBeenCalledTimes(1)
    const call = send.mock.calls[0] as [{ to: string; code: string }] | undefined
    if (!call) throw new Error('send not called')
    const sendArg = call[0]
    expect(sendArg.to).toBe('cadet@crma.ac.th') // normalised
    expect(sendArg.code).toMatch(/^\d{6}$/)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ALLOW' }))
  })
})

describe('POST /api/auth/email/start — send failure', () => {
  test('Brevo non-ok → 502 send_failed + audit ERROR', async () => {
    const token = await signEnrolToken(ENROL)
    const { handler, audit } = setup({ send: { ok: false, reason: 'brevo:500' } })
    const res = await handler(await postWithCookie({ email: 'cadet@crma.ac.th' }, token))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('send_failed')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'ERROR', metadata: { reason: 'brevo:500' } }),
    )
  })
})
