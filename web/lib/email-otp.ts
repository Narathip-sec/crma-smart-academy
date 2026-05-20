// Email OTP issue/verify service. Factory pattern keeps prisma injectable
// for unit tests. Code plaintext never persists; we store SHA-256 hex.
// Edge-compatible — Web Crypto only.

export const OTP_LENGTH = 6
export const OTP_TTL_SECONDS = 600
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RATE_LIMIT_SECONDS = 60

export type OtpRow = {
  id: string
  userId: string
  codeHash: string
  emailHash: string
  expiresAt: Date
  attempts: number
  consumedAt: Date | null
  createdAt: Date
}

export type VerifyResult =
  | { ok: true; emailHash: string }
  | {
      ok: false
      reason: 'expired' | 'mismatch' | 'attempts_exceeded' | 'not_found'
    }

export type EmailOtpPrisma = {
  emailOtp: {
    create: (args: {
      data: Omit<OtpRow, 'id' | 'createdAt'> & { createdAt?: Date }
    }) => Promise<OtpRow>
    findFirst: (args: {
      where: {
        userId: string
        consumedAt?: null
        createdAt?: { gt: Date }
      }
      orderBy?: { createdAt: 'desc' | 'asc' }
    }) => Promise<OtpRow | null>
    update: (args: {
      where: { id: string }
      data: Partial<Pick<OtpRow, 'attempts' | 'consumedAt'>>
    }) => Promise<OtpRow>
  }
}

// Rejection-sampled uniform 6-digit code via Web Crypto. Avoids modulo
// bias by discarding values >= the largest multiple of 1_000_000.
export function generateCode(): string {
  const max = 1_000_000
  const limit = Math.floor(0xffffffff / max) * max
  const buf = new Uint32Array(1)
  let n: number
  do {
    crypto.getRandomValues(buf)
    n = buf[0] ?? 0
  } while (n >= limit)
  return String(n % max).padStart(OTP_LENGTH, '0')
}

export async function hashCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code)
  const buf = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buf).set(bytes)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  const view = new Uint8Array(digest)
  let out = ''
  for (let i = 0; i < view.length; i++) {
    out += (view[i] ?? 0).toString(16).padStart(2, '0')
  }
  return out
}

export function createOtpService(deps: { prisma: EmailOtpPrisma }) {
  const { prisma } = deps

  async function issue(opts: {
    userId: string
    emailHash: string
  }): Promise<{ code: string; expiresAt: Date }> {
    const code = generateCode()
    const codeHash = await hashCode(code)
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000)
    await prisma.emailOtp.create({
      data: {
        userId: opts.userId,
        emailHash: opts.emailHash,
        codeHash,
        expiresAt,
        attempts: 0,
        consumedAt: null,
      },
    })
    return { code, expiresAt }
  }

  async function verify(opts: { userId: string; code: string }): Promise<VerifyResult> {
    const row = await prisma.emailOtp.findFirst({
      where: { userId: opts.userId, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    if (!row) return { ok: false, reason: 'not_found' }

    if (row.expiresAt.getTime() <= Date.now()) {
      await prisma.emailOtp.update({
        where: { id: row.id },
        data: { consumedAt: new Date() },
      })
      return { ok: false, reason: 'expired' }
    }

    const codeHash = await hashCode(opts.code)
    if (codeHash !== row.codeHash) {
      const attempts = row.attempts + 1
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await prisma.emailOtp.update({
          where: { id: row.id },
          data: { attempts, consumedAt: new Date() },
        })
        return { ok: false, reason: 'attempts_exceeded' }
      }
      await prisma.emailOtp.update({
        where: { id: row.id },
        data: { attempts },
      })
      return { ok: false, reason: 'mismatch' }
    }

    await prisma.emailOtp.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    })
    return { ok: true, emailHash: row.emailHash }
  }

  async function canSendAgain(opts: { userId: string }): Promise<{ ok: boolean; retryAt?: Date }> {
    const since = new Date(Date.now() - OTP_RATE_LIMIT_SECONDS * 1000)
    const recent = await prisma.emailOtp.findFirst({
      where: { userId: opts.userId, createdAt: { gt: since } },
      orderBy: { createdAt: 'desc' },
    })
    if (!recent) return { ok: true }
    const retryAt = new Date(recent.createdAt.getTime() + OTP_RATE_LIMIT_SECONDS * 1000)
    return { ok: false, retryAt }
  }

  return { issue, verify, canSendAgain }
}
