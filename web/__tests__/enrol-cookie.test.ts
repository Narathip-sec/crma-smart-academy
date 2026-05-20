// @vitest-environment node
import { describe, expect, test, vi } from 'vitest'

import {
  buildEnrolCookie,
  clearEnrolCookie,
  ENROL_COOKIE,
  signAccessToken,
  signEnrolToken,
  signRefreshToken,
  verifyAccessToken,
  verifyEnrolToken,
  verifyRefreshToken,
  type EnrolPayload,
  type SessionPayload,
} from '@/lib/session'

const enrol: EnrolPayload = {
  sub: 'user_enrol_1',
  lineUserId: 'U_line_123',
  deviceFp: 'devfp_enrol',
}

const sess: SessionPayload = {
  sub: 'user_enrol_1',
  role: 'CADET',
  cadetId: 'CDT-2568-001',
  deviceFp: 'devfp_enrol',
}

describe('session — enrol token round-trip', () => {
  test('sign + verify returns payload', async () => {
    const token = await signEnrolToken(enrol)
    const verified = await verifyEnrolToken(token)
    expect(verified).toEqual(enrol)
  })

  test('tampered token rejected', async () => {
    const token = await signEnrolToken(enrol)
    const tampered = `${token.slice(0, -4)}AAAA`
    await expect(verifyEnrolToken(tampered)).rejects.toThrow()
  })

  test('expires after 15 minutes', async () => {
    vi.useFakeTimers()
    const realNow = Date.now()
    try {
      vi.setSystemTime(realNow)
      const token = await signEnrolToken(enrol)
      vi.setSystemTime(realNow + 15 * 60 * 1000 + 60 * 1000) // +15m+1m
      await expect(verifyEnrolToken(token)).rejects.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('session — enrol audience guard', () => {
  test('access token rejected by enrol verifier', async () => {
    const access = await signAccessToken(sess)
    await expect(verifyEnrolToken(access)).rejects.toThrow()
  })

  test('refresh token rejected by enrol verifier', async () => {
    const { token } = await signRefreshToken(sess)
    await expect(verifyEnrolToken(token)).rejects.toThrow()
  })

  test('enrol token rejected by access verifier', async () => {
    const token = await signEnrolToken(enrol)
    await expect(verifyAccessToken(token)).rejects.toThrow()
  })

  test('enrol token rejected by refresh verifier', async () => {
    const token = await signEnrolToken(enrol)
    await expect(verifyRefreshToken(token)).rejects.toThrow()
  })
})

describe('session — enrol cookie shape', () => {
  test('cookie name + flags', () => {
    const cookie = buildEnrolCookie('abc.def.ghi')
    expect(cookie).toMatch(new RegExp(`^${ENROL_COOKIE}=abc\\.def\\.ghi;`))
    expect(cookie).toMatch(/;\s*HttpOnly/i)
    expect(cookie).toMatch(/;\s*Secure/i)
    expect(cookie).toMatch(/;\s*SameSite=Lax/i)
    expect(cookie).toMatch(/;\s*Path=\//i)
    expect(cookie).toMatch(/;\s*Max-Age=900/i)
    expect(cookie).not.toMatch(/;\s*Domain=/i)
  })

  test('cookie name uses __Host- prefix', () => {
    expect(ENROL_COOKIE.startsWith('__Host-')).toBe(true)
  })

  test('clearEnrolCookie returns Max-Age=0 with same flags', () => {
    const c = clearEnrolCookie()
    expect(c).toMatch(new RegExp(`^${ENROL_COOKIE}=;`))
    expect(c).toMatch(/Max-Age=0/i)
    expect(c).toMatch(/HttpOnly/i)
    expect(c).toMatch(/Secure/i)
  })
})
