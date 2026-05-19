// @vitest-environment node
import { createHash } from 'node:crypto'

import { describe, expect, test, vi } from 'vitest'

import {
  ACCESS_COOKIE,
  buildAccessCookie,
  buildRefreshCookie,
  clearAuthCookies,
  REFRESH_COOKIE,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type SessionPayload,
} from '@/lib/session'

const sample: SessionPayload = {
  sub: 'user_abc123',
  role: 'CADET',
  cadetId: 'CDT-2568-001',
  email: 'cadet@crma.ac.th',
  deviceFp: 'devfp_xyz789',
}

describe('session — access token round-trip', () => {
  test('sign + verify returns payload', async () => {
    const token = await signAccessToken(sample)
    const verified = await verifyAccessToken(token)
    expect(verified.sub).toBe(sample.sub)
    expect(verified.role).toBe(sample.role)
    expect(verified.cadetId).toBe(sample.cadetId)
    expect(verified.email).toBe(sample.email)
    expect(verified.deviceFp).toBe(sample.deviceFp)
  })

  test('tampered token rejected', async () => {
    const token = await signAccessToken(sample)
    const tampered = `${token.slice(0, -4)}AAAA`
    await expect(verifyAccessToken(tampered)).rejects.toThrow()
  })

  test('expired access token rejected', async () => {
    vi.useFakeTimers()
    const realNow = Date.now()
    try {
      vi.setSystemTime(realNow)
      const token = await signAccessToken(sample)
      vi.setSystemTime(realNow + 60 * 60 * 1000 + 60 * 1000) // +1h+1m
      await expect(verifyAccessToken(token)).rejects.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('session — refresh token round-trip', () => {
  test('sign produces token, sha256 hash, +30d expiry', async () => {
    const before = Date.now()
    const { token, hash, expiresAt } = await signRefreshToken(sample)

    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const expected = createHash('sha256').update(token).digest('hex')
    expect(hash).toBe(expected)

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    const drift = Math.abs(expiresAt.getTime() - (before + thirtyDaysMs))
    expect(drift).toBeLessThan(5000)
  })

  test('verify round-trip', async () => {
    const { token } = await signRefreshToken(sample)
    const verified = await verifyRefreshToken(token)
    expect(verified.sub).toBe(sample.sub)
    expect(verified.deviceFp).toBe(sample.deviceFp)
  })

  test('access token rejected by refresh verifier (audience guard)', async () => {
    const access = await signAccessToken(sample)
    await expect(verifyRefreshToken(access)).rejects.toThrow()
  })
})

describe('session — cookie shape', () => {
  test('access cookie name + flags', () => {
    const cookie = buildAccessCookie('abc.def.ghi')
    expect(cookie).toMatch(new RegExp(`^${ACCESS_COOKIE}=abc\\.def\\.ghi;`))
    expect(cookie).toMatch(/;\s*HttpOnly/i)
    expect(cookie).toMatch(/;\s*Secure/i)
    expect(cookie).toMatch(/;\s*SameSite=Lax/i)
    expect(cookie).toMatch(/;\s*Path=\//i)
    expect(cookie).toMatch(/;\s*Max-Age=3600/i)
    expect(cookie).not.toMatch(/;\s*Domain=/i) // __Host- prefix bans Domain
  })

  test('refresh cookie name + flags', () => {
    const cookie = buildRefreshCookie('abc.def.ghi')
    expect(cookie).toMatch(new RegExp(`^${REFRESH_COOKIE}=abc\\.def\\.ghi;`))
    expect(cookie).toMatch(/;\s*HttpOnly/i)
    expect(cookie).toMatch(/;\s*Secure/i)
    expect(cookie).toMatch(/;\s*SameSite=Lax/i)
    expect(cookie).toMatch(/;\s*Path=\//i)
    expect(cookie).toMatch(/;\s*Max-Age=2592000/i)
    expect(cookie).not.toMatch(/;\s*Domain=/i)
  })

  test('cookie names use __Host- prefix', () => {
    expect(ACCESS_COOKIE.startsWith('__Host-')).toBe(true)
    expect(REFRESH_COOKIE.startsWith('__Host-')).toBe(true)
  })

  test('clearAuthCookies returns both names with Max-Age=0', () => {
    const cleared = clearAuthCookies()
    expect(cleared).toHaveLength(2)
    expect(cleared[0]).toMatch(new RegExp(`^${ACCESS_COOKIE}=;`))
    expect(cleared[1]).toMatch(new RegExp(`^${REFRESH_COOKIE}=;`))
    for (const c of cleared) {
      expect(c).toMatch(/Max-Age=0/i)
      expect(c).toMatch(/HttpOnly/i)
      expect(c).toMatch(/Secure/i)
    }
  })
})
