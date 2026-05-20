// @vitest-environment node
import { Secret, TOTP } from 'otpauth'
import { describe, expect, test } from 'vitest'

import {
  buildOtpAuthUri,
  buildQrDataUrl,
  generateSecret,
  TOTP_ALGORITHM,
  TOTP_DIGITS,
  TOTP_ISSUER,
  TOTP_PERIOD_SECONDS,
  TOTP_SECRET_BYTES,
  TOTP_WINDOW_STEPS,
  verifyCode,
} from '@/lib/totp'

describe('lib/totp — constants', () => {
  test('matches plan', () => {
    expect(TOTP_DIGITS).toBe(6)
    expect(TOTP_PERIOD_SECONDS).toBe(30)
    expect(TOTP_WINDOW_STEPS).toBe(1)
    expect(TOTP_SECRET_BYTES).toBe(20)
    expect(TOTP_ALGORITHM).toBe('SHA1')
    expect(TOTP_ISSUER).toBe('CRMA Smart Academy')
  })
})

describe('lib/totp — generateSecret', () => {
  test('emits 32-char base32', () => {
    const secret = generateSecret()
    expect(secret).toMatch(/^[A-Z2-7]+=*$/)
    // 20 bytes → 32 base32 chars (no padding for byte-aligned output)
    expect(secret.length).toBeGreaterThanOrEqual(32)
  })

  test('produces variety', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 20; i++) seen.add(generateSecret())
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('lib/totp — buildOtpAuthUri', () => {
  test('returns an otpauth:// URI with issuer, account, and parameters', () => {
    const secret = generateSecret()
    const uri = buildOtpAuthUri({ secret, account: 'CDT-2568-001' })
    expect(uri).toMatch(/^otpauth:\/\/totp\//)
    expect(uri).toContain(encodeURIComponent(TOTP_ISSUER))
    expect(uri).toContain('CDT-2568-001')
    expect(uri).toContain(`secret=${secret}`)
    expect(uri).toContain(`period=${TOTP_PERIOD_SECONDS}`)
    expect(uri).toContain(`digits=${TOTP_DIGITS}`)
    expect(uri).toContain(`algorithm=${TOTP_ALGORITHM}`)
  })
})

describe('lib/totp — verifyCode', () => {
  test('accepts a freshly generated code for the same secret', () => {
    const secret = generateSecret()
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: 'CDT-001',
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      secret: Secret.fromBase32(secret),
    })
    const code = totp.generate()
    expect(verifyCode({ secret, code })).toBe(true)
  })

  test('rejects a wrong code', () => {
    const secret = generateSecret()
    expect(verifyCode({ secret, code: '000000' })).toBe(false)
  })

  test('rejects a malformed code (non-digit / wrong length)', () => {
    const secret = generateSecret()
    expect(verifyCode({ secret, code: 'abcdef' })).toBe(false)
    expect(verifyCode({ secret, code: '12345' })).toBe(false)
    expect(verifyCode({ secret, code: '1234567' })).toBe(false)
  })

  test('accepts a code from 1 step earlier (clock skew tolerance)', () => {
    const secret = generateSecret()
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: 'CDT-001',
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      secret: Secret.fromBase32(secret),
    })
    const oneStepAgo = Date.now() - TOTP_PERIOD_SECONDS * 1000
    const code = totp.generate({ timestamp: oneStepAgo })
    expect(verifyCode({ secret, code })).toBe(true)
  })

  test('rejects a code from 5 steps ago (outside the ±1 window)', () => {
    const secret = generateSecret()
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: 'CDT-001',
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      secret: Secret.fromBase32(secret),
    })
    const fiveStepsAgo = Date.now() - 5 * TOTP_PERIOD_SECONDS * 1000
    const code = totp.generate({ timestamp: fiveStepsAgo })
    expect(verifyCode({ secret, code })).toBe(false)
  })
})

describe('lib/totp — buildQrDataUrl', () => {
  test('returns a PNG data URL', async () => {
    const uri = buildOtpAuthUri({ secret: generateSecret(), account: 'CDT-001' })
    const dataUrl = await buildQrDataUrl(uri)
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(dataUrl.length).toBeGreaterThan(64) // sanity: actual PNG content
  })
})
