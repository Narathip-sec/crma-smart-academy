// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  ACCESS_COOKIE,
  ENROL_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  signEnrolToken,
  signRefreshToken,
  type EnrolPayload,
  type SessionPayload,
} from '@/lib/session'
import { middleware } from '@/middleware'

const sample: SessionPayload = {
  sub: 'user_abc',
  role: 'CADET',
  cadetId: 'CDT-001',
  deviceFp: 'devfp',
}

function build(url: string, cookies: Record<string, string> = {}, method = 'GET') {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
  return new NextRequest(new URL(url, 'http://localhost'), {
    method,
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })
}

describe('middleware — public bypass', () => {
  test('skips /_next/*', async () => {
    const res = await middleware(build('/_next/static/chunk.js'))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  test('skips /favicon.ico', async () => {
    const res = await middleware(build('/favicon.ico'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  test('skips /api/auth/* (bootstrap routes)', async () => {
    const res = await middleware(build('/api/auth/line/callback'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  test('skips /login (public page)', async () => {
    const res = await middleware(build('/login'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })
})

describe('middleware — unauthenticated', () => {
  test('no cookie on /api/* returns 401', async () => {
    const res = await middleware(build('/api/grades'))
    expect(res.status).toBe(401)
  })

  test('no cookie on app route redirects to /login with ?return=', async () => {
    const res = await middleware(build('/home'))
    expect(res.status).toBe(307)
    const loc = res.headers.get('location')
    expect(loc).toContain('/login')
    expect(loc).toContain('return=%2Fhome')
  })

  test('tampered access cookie + no refresh on /api/* returns 401', async () => {
    const res = await middleware(build('/api/grades', { [ACCESS_COOKIE]: 'not.a.jwt' }))
    expect(res.status).toBe(401)
  })
})

describe('middleware — authenticated', () => {
  test('valid access cookie attaches x-user-* headers and passes through', async () => {
    const token = await signAccessToken(sample)
    const res = await middleware(build('/home', { [ACCESS_COOKIE]: token }))
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-user-id')).toBe(sample.sub)
    expect(res.headers.get('x-user-role')).toBe(sample.role)
    expect(res.headers.get('x-user-cadetid')).toBe(sample.cadetId)
  })

  test('valid access cookie on /api/* passes through with headers', async () => {
    const token = await signAccessToken(sample)
    const res = await middleware(build('/api/grades', { [ACCESS_COOKIE]: token }, 'GET'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-user-id')).toBe(sample.sub)
  })
})

describe('middleware — refresh flow', () => {
  test('expired access + valid refresh mints new access cookie', async () => {
    vi.useFakeTimers()
    const realNow = Date.now()
    try {
      vi.setSystemTime(realNow)
      const accessToken = await signAccessToken(sample)
      const { token: refreshToken } = await signRefreshToken(sample)

      vi.setSystemTime(realNow + 60 * 60 * 1000 + 60_000) // +1h+1m

      const res = await middleware(
        build('/home', {
          [ACCESS_COOKIE]: accessToken,
          [REFRESH_COOKIE]: refreshToken,
        }),
      )

      expect(res.headers.get('x-middleware-next')).toBe('1')
      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toBeTruthy()
      expect(setCookie).toContain(`${ACCESS_COOKIE}=`)
    } finally {
      vi.useRealTimers()
    }
  })

  test('invalid access + invalid refresh → 401 on /api/*', async () => {
    const res = await middleware(
      build('/api/grades', {
        [ACCESS_COOKIE]: 'bad.token.here',
        [REFRESH_COOKIE]: 'also.bad.here',
      }),
    )
    expect(res.status).toBe(401)
  })
})

describe('middleware — enrol cookie', () => {
  const enrolSample: EnrolPayload = {
    sub: 'user_enrol',
    lineUserId: 'U_line',
    deviceFp: 'devfp',
  }

  test('valid enrol cookie on /enrol/email passes through (no x-user-* headers)', async () => {
    const token = await signEnrolToken(enrolSample)
    const res = await middleware(build('/enrol/email', { [ENROL_COOKIE]: token }))
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(res.headers.get('x-user-id')).toBeNull()
  })

  test('no enrol cookie on /enrol/email → redirect to /login', async () => {
    const res = await middleware(build('/enrol/email'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  test('access cookie alone does NOT satisfy /enrol/email (audience guard)', async () => {
    const access = await signAccessToken(sample)
    const res = await middleware(build('/enrol/email', { [ACCESS_COOKIE]: access }))
    expect(res.status).toBe(307)
  })

  test('invalid enrol cookie on /enrol/email → redirect to /login', async () => {
    const res = await middleware(build('/enrol/email', { [ENROL_COOKIE]: 'bad.token.here' }))
    expect(res.status).toBe(307)
  })

  test('valid enrol cookie on /reverify/totp passes through (Phase 2e allow-list)', async () => {
    const token = await signEnrolToken(enrolSample)
    const res = await middleware(build('/reverify/totp', { [ENROL_COOKIE]: token }))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  test('no enrol cookie on /reverify/totp → redirect to /login', async () => {
    const res = await middleware(build('/reverify/totp'))
    expect(res.status).toBe(307)
  })
})

describe('middleware — config matcher', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('exports a matcher config', async () => {
    const mod = await import('@/middleware')
    expect(mod.config).toBeDefined()
    expect(mod.config.matcher).toBeDefined()
  })
})
