// @vitest-environment node
import { Secret, TOTP } from 'otpauth'
import { describe, expect, test } from 'vitest'

import {
  buildOtpAuthUri,
  buildQrDataUrl,
  consumeCode,
  currentStep,
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

describe('lib/totp — currentStep', () => {
  test('floor(ts / 30_000) as bigint', () => {
    expect(currentStep(0)).toBe(0n)
    expect(currentStep(29_999)).toBe(0n)
    expect(currentStep(30_000)).toBe(1n)
    expect(currentStep(60_000)).toBe(2n)
  })

  test('default arg uses Date.now()', () => {
    const before = BigInt(Math.floor(Date.now() / 30_000))
    const s = currentStep()
    expect(s >= before).toBe(true)
  })
})

describe('lib/totp — consumeCode', () => {
  function codeAt(secret: string, timestamp: number): string {
    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      label: 'CDT-001',
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      secret: Secret.fromBase32(secret),
    })
    return totp.generate({ timestamp })
  }

  test('happy path returns the consumed step', () => {
    const secret = generateSecret()
    const ts = 1_800_000_000_000
    const code = codeAt(secret, ts)
    const result = consumeCode({ secret, code, lastStep: null, timestampMs: ts })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.step).toBe(BigInt(Math.floor(ts / 30_000)))
  })

  test('wrong code → invalid_code', () => {
    const secret = generateSecret()
    expect(consumeCode({ secret, code: '000000', lastStep: null }).ok).toBe(false)
  })

  test('malformed code (non-digit / wrong length) → invalid_code', () => {
    const secret = generateSecret()
    const r = consumeCode({ secret, code: 'abc', lastStep: null })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('invalid_code')
  })

  test('replay: lastStep equals consumed step → replay', () => {
    const secret = generateSecret()
    const ts = 1_800_000_000_000
    const code = codeAt(secret, ts)
    const usedStep = BigInt(Math.floor(ts / 30_000))
    const r = consumeCode({ secret, code, lastStep: usedStep, timestampMs: ts })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('replay')
  })

  test('replay: lastStep > consumed step → replay', () => {
    const secret = generateSecret()
    const ts = 1_800_000_000_000
    const code = codeAt(secret, ts)
    const r = consumeCode({ secret, code, lastStep: 999_999_999_999n, timestampMs: ts })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('replay')
  })

  test('lastStep = step - 1 → accept (first valid code after previous)', () => {
    const secret = generateSecret()
    const ts = 1_800_000_000_000
    const code = codeAt(secret, ts)
    const usedStep = BigInt(Math.floor(ts / 30_000))
    const r = consumeCode({ secret, code, lastStep: usedStep - 1n, timestampMs: ts })
    expect(r.ok).toBe(true)
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
