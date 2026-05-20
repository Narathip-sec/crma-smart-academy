// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  createOtpService,
  generateCode,
  hashCode,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RATE_LIMIT_SECONDS,
  OTP_TTL_SECONDS,
} from '@/lib/email-otp'

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

function mockPrisma() {
  let nextId = 1
  const rows: OtpRow[] = []
  return {
    rows,
    emailOtp: {
      create: vi.fn(
        async ({ data }: { data: Omit<OtpRow, 'id' | 'createdAt'> & { createdAt?: Date } }) => {
          const row: OtpRow = {
            id: `otp_${nextId++}`,
            createdAt: data.createdAt ?? new Date(),
            ...data,
          }
          rows.unshift(row)
          return row
        },
      ),
      findFirst: vi.fn(
        async ({
          where,
          orderBy: _orderBy,
        }: {
          where: Record<string, unknown>
          orderBy?: unknown
        }) => {
          // userId + consumedAt: null + (optional) createdAt gt
          return (
            rows.find((r) => {
              if (where.userId && r.userId !== where.userId) return false
              if (where.consumedAt === null && r.consumedAt !== null) return false
              const created = where.createdAt as { gt?: Date } | undefined
              if (created?.gt && !(r.createdAt > created.gt)) return false
              return true
            }) ?? null
          )
        },
      ),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<OtpRow> }) => {
        const row = rows.find((r) => r.id === where.id)
        if (!row) throw new Error('row not found')
        Object.assign(row, data)
        return row
      }),
    },
  }
}

beforeEach(() => {
  vi.useRealTimers()
})

describe('lib/email-otp — constants', () => {
  test('matches plan', () => {
    expect(OTP_LENGTH).toBe(6)
    expect(OTP_TTL_SECONDS).toBe(600)
    expect(OTP_MAX_ATTEMPTS).toBe(5)
    expect(OTP_RATE_LIMIT_SECONDS).toBe(60)
  })
})

describe('lib/email-otp — generateCode', () => {
  test('returns 6 numeric digits', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode()
      expect(code).toMatch(/^\d{6}$/)
    }
  })

  test('produces variety (not constant)', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(generateCode())
    // Extremely unlikely all 50 are identical with a fair RNG.
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('lib/email-otp — hashCode', () => {
  test('SHA-256 hex, deterministic', async () => {
    const a = await hashCode('123456')
    const b = await hashCode('123456')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  test('different codes produce different hashes', async () => {
    expect(await hashCode('111111')).not.toBe(await hashCode('222222'))
  })
})

describe('lib/email-otp — issue', () => {
  test('persists a row with codeHash + expiresAt and returns the plaintext code', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    const before = Date.now()
    const out = await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })
    const after = Date.now()

    expect(out.code).toMatch(/^\d{6}$/)
    expect(out.expiresAt.getTime()).toBeGreaterThanOrEqual(before + OTP_TTL_SECONDS * 1000 - 50)
    expect(out.expiresAt.getTime()).toBeLessThanOrEqual(after + OTP_TTL_SECONDS * 1000 + 50)

    expect(prisma.emailOtp.create).toHaveBeenCalledTimes(1)
    const row = prisma.rows[0]
    expect(row?.userId).toBe('user_1')
    expect(row?.emailHash).toBe('hash_a')
    expect(row?.codeHash).toBe(await hashCode(out.code))
    expect(row?.attempts).toBe(0)
    expect(row?.consumedAt).toBeNull()
  })
})

describe('lib/email-otp — verify', () => {
  test('matching code → ok + returns row.emailHash + consumes the row', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    const { code } = await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })

    const result = await svc.verify({ userId: 'user_1', code })
    expect(result).toEqual({ ok: true, emailHash: 'hash_a' })
    expect(prisma.rows[0]?.consumedAt).toBeInstanceOf(Date)
  })

  test('mismatched code → mismatch + increments attempts', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })

    const result = await svc.verify({ userId: 'user_1', code: '000000' })
    expect(result).toEqual({ ok: false, reason: 'mismatch' })
    expect(prisma.rows[0]?.attempts).toBe(1)
    expect(prisma.rows[0]?.consumedAt).toBeNull()
  })

  test('5th wrong attempt → attempts_exceeded + consumes row', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })

    for (let i = 0; i < OTP_MAX_ATTEMPTS - 1; i++) {
      const r = await svc.verify({ userId: 'user_1', code: '000000' })
      expect(r).toEqual({ ok: false, reason: 'mismatch' })
    }
    const final = await svc.verify({ userId: 'user_1', code: '000000' })
    expect(final).toEqual({ ok: false, reason: 'attempts_exceeded' })
    expect(prisma.rows[0]?.consumedAt).toBeInstanceOf(Date)
  })

  test('row past expiresAt → expired (no attempt increment, row consumed)', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    const { code } = await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })
    // backdate expiry
    if (prisma.rows[0]) prisma.rows[0].expiresAt = new Date(Date.now() - 1000)

    const result = await svc.verify({ userId: 'user_1', code })
    expect(result).toEqual({ ok: false, reason: 'expired' })
    expect(prisma.rows[0]?.consumedAt).toBeInstanceOf(Date)
  })

  test('no row → not_found', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    const result = await svc.verify({ userId: 'user_1', code: '123456' })
    expect(result).toEqual({ ok: false, reason: 'not_found' })
  })
})

describe('lib/email-otp — canSendAgain', () => {
  test('no recent rows → ok: true', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    const out = await svc.canSendAgain({ userId: 'user_1' })
    expect(out.ok).toBe(true)
    expect(out.retryAt).toBeUndefined()
  })

  test('row created < 60s ago → ok: false with retryAt', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })

    const out = await svc.canSendAgain({ userId: 'user_1' })
    expect(out.ok).toBe(false)
    expect(out.retryAt).toBeInstanceOf(Date)
    expect(out.retryAt!.getTime()).toBeGreaterThan(Date.now())
  })

  test('row created > 60s ago → ok: true', async () => {
    const prisma = mockPrisma()
    const svc = createOtpService({ prisma: prisma as never })
    await svc.issue({ userId: 'user_1', emailHash: 'hash_a' })
    if (prisma.rows[0]) {
      prisma.rows[0].createdAt = new Date(Date.now() - (OTP_RATE_LIMIT_SECONDS + 5) * 1000)
    }

    const out = await svc.canSendAgain({ userId: 'user_1' })
    expect(out.ok).toBe(true)
  })
})
