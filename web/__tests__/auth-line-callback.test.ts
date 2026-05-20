// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createLineCallbackHandler } from '@/app/api/auth/line/callback/handler'
import { ACCESS_COOKIE, ENROL_COOKIE, REFRESH_COOKIE } from '@/lib/session'

import type { LineProfile } from '@/lib/line'

const PROFILE: LineProfile = {
  lineUserId: 'Uabcdef',
  displayName: 'Cadet Test',
  picture: 'https://example/p.png',
}

type UserState = 'new' | 'needs_totp' | 'enrolled' | 'none'

function fakeUser(state: UserState) {
  if (state === 'none') return null
  return {
    id: 'user_1',
    cadetId: 'CDT-001',
    emailHash: 'pre-hashed-placeholder',
    emailCiphertext: state === 'new' ? null : 'pre-encrypted-email',
    emailVerified: state === 'new' ? null : new Date(),
    lineUserId: PROFILE.lineUserId,
    displayName: PROFILE.displayName,
    avatarUrl: PROFILE.picture ?? null,
    role: 'CADET',
    company: null,
    year: null,
    totpSecret: state === 'enrolled' ? 'encrypted-secret' : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function setup(state: UserState, opts?: { verifyError?: Error }) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const verify = opts?.verifyError
    ? vi.fn().mockRejectedValue(opts.verifyError)
    : vi.fn().mockResolvedValue(PROFILE)

  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue(fakeUser(state)),
      upsert: vi.fn().mockResolvedValue(fakeUser(state === 'none' ? 'new' : state)),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue({ id: 'rt_1' }),
    },
  }

  const handler = createLineCallbackHandler({
    prisma: prisma as never,
    verifyLineIdToken: verify,
    audit,
  })
  return { handler, prisma, audit, verify }
}

function postBody(body: unknown) {
  return new NextRequest(new URL('http://localhost/api/auth/line/callback'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  process.env.LINE_CHANNEL_ID = '1234567890'
  // Crypto envelope keys for the placeholder emailHash computation.
  process.env.HMAC_KEY = 'IBshHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs'
  process.env.ENCRYPTION_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8'
})

describe('POST /api/auth/line/callback — input validation', () => {
  test('missing body → 400 with audit DENY', async () => {
    const { handler, audit } = setup('none')
    const req = new NextRequest(new URL('http://localhost/api/auth/line/callback'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'AUTH:line_callback',
        result: 'DENY',
      }),
    )
  })

  test('LINE_CHANNEL_ID missing → 503 with audit ERROR', async () => {
    delete process.env.LINE_CHANNEL_ID
    const { handler, audit } = setup('none')
    const res = await handler(postBody({ idToken: 'x', deviceFp: 'd' }))
    expect(res.status).toBe(503)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ERROR' }))
  })
})

describe('POST /api/auth/line/callback — verification failure', () => {
  test('verifier rejects → 401 with audit DENY', async () => {
    const { handler, audit } = setup('none', { verifyError: new Error('jwks: bad sig') })
    const res = await handler(postBody({ idToken: 'tampered', deviceFp: 'd' }))
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'AUTH:line_callback', result: 'DENY' }),
    )
  })
})

describe('POST /api/auth/line/callback — enrolment branches', () => {
  test('new user upsert → 200 needs_email + enrol cookie (no session cookies)', async () => {
    const { handler, prisma, audit } = setup('new')
    const res = await handler(postBody({ idToken: 'good', deviceFp: 'd' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('needs_email')
    expect(prisma.user.upsert).toHaveBeenCalledTimes(1)
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'ALLOW' }))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ENROL_COOKIE}=`)
    expect(setCookie).not.toContain(`${ACCESS_COOKIE}=`)
    expect(setCookie).not.toContain(`${REFRESH_COOKIE}=`)
  })

  test('email verified but no TOTP → 200 needs_totp + enrol cookie', async () => {
    const { handler } = setup('needs_totp')
    const res = await handler(postBody({ idToken: 'good', deviceFp: 'd' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('needs_totp')
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ENROL_COOKIE}=`)
    expect(setCookie).not.toContain(`${ACCESS_COOKIE}=`)
  })

  test('fully enroled → 200 ok with cookies + RefreshToken row', async () => {
    const { handler, prisma } = setup('enrolled')
    const res = await handler(postBody({ idToken: 'good', deviceFp: 'd' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=`)
    expect(setCookie).toContain(`${REFRESH_COOKIE}=`)
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1)
    const rtArg = prisma.refreshToken.create.mock.calls[0]?.[0]
    expect(rtArg?.data.userId).toBe('user_1')
    expect(rtArg?.data.deviceFp).toBe('d')
    expect(typeof rtArg?.data.tokenHash).toBe('string')
    expect(rtArg?.data.expiresAt).toBeInstanceOf(Date)
  })
})
