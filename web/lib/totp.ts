// Thin wrappers around the `otpauth` + `qrcode` libraries. All flows go
// through here so the route handlers stay focused on Prisma + audit
// orchestration. RFC 6238 defaults (SHA1, 30 s, 6 digits) are pinned
// here and surface as exported constants for unit-test assertions.

import { Secret, TOTP } from 'otpauth'
import QRCode from 'qrcode'

export const TOTP_ISSUER = 'CRMA Smart Academy'
export const TOTP_DIGITS = 6
export const TOTP_PERIOD_SECONDS = 30
export const TOTP_WINDOW_STEPS = 1
export const TOTP_SECRET_BYTES = 20
export const TOTP_ALGORITHM = 'SHA1' as const

function totpFor(secretBase32: string, account: string): TOTP {
  return new TOTP({
    issuer: TOTP_ISSUER,
    label: account,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(secretBase32),
  })
}

export function generateSecret(): string {
  // `new Secret({ size })` uses Web Crypto getRandomValues under the hood.
  return new Secret({ size: TOTP_SECRET_BYTES }).base32
}

export function buildOtpAuthUri(opts: { secret: string; account: string }): string {
  return totpFor(opts.secret, opts.account).toString()
}

export async function buildQrDataUrl(otpAuthUri: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri, { errorCorrectionLevel: 'M', margin: 1 })
}

export function verifyCode(opts: { secret: string; code: string; account?: string }): boolean {
  if (!/^\d{6}$/.test(opts.code)) return false
  const totp = totpFor(opts.secret, opts.account ?? 'verify')
  // `validate` returns the step delta (number) on hit, null on miss.
  const delta = totp.validate({ token: opts.code, window: TOTP_WINDOW_STEPS })
  return delta !== null
}

// Floor of (timestamp / period) — the canonical TOTP step counter from
// RFC 6238 §4.2. BigInt because the quotient overflows Int32 in 2038.
export function currentStep(timestampMs?: number): bigint {
  const ms = timestampMs ?? Date.now()
  return BigInt(Math.floor(ms / (TOTP_PERIOD_SECONDS * 1000)))
}

export type ConsumeResult =
  | { ok: true; step: bigint }
  | { ok: false; reason: 'invalid_code' | 'replay' }

// Replay-aware verify. Returns the consumed step so the caller can
// persist it to User.lastTotpStep. A code that resolves to a step
// less than or equal to `lastStep` is rejected with 'replay'.
export function consumeCode(opts: {
  secret: string
  code: string
  lastStep: bigint | null
  timestampMs?: number
  account?: string
}): ConsumeResult {
  if (!/^\d{6}$/.test(opts.code)) return { ok: false, reason: 'invalid_code' }
  const totp = totpFor(opts.secret, opts.account ?? 'verify')
  const ts = opts.timestampMs ?? Date.now()
  const delta = totp.validate({
    token: opts.code,
    window: TOTP_WINDOW_STEPS,
    timestamp: ts,
  })
  if (delta === null) return { ok: false, reason: 'invalid_code' }
  const step = currentStep(ts) + BigInt(delta)
  if (opts.lastStep !== null && step <= opts.lastStep) {
    return { ok: false, reason: 'replay' }
  }
  return { ok: true, step }
}
