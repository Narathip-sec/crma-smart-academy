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
