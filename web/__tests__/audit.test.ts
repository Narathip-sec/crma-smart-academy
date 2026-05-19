// @vitest-environment node
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createAudit } from '@/lib/audit'

function mockPrisma() {
  return {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'log_1' }),
    },
  }
}

describe('audit — happy path', () => {
  test('writes one row with all fields', async () => {
    const prisma = mockPrisma()
    const audit = createAudit({ prisma: prisma as never })

    await audit({
      userId: 'user_1',
      action: 'WRITE:roster',
      resource: 'roster:2026-05-19',
      ip: '127.0.0.1',
      userAgent: 'LINE/13',
      metadata: { shift: '00-06' },
    })

    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1)
    const arg = prisma.auditLog.create.mock.calls[0]?.[0]
    expect(arg?.data).toMatchObject({
      userId: 'user_1',
      action: 'WRITE:roster',
      resource: 'roster:2026-05-19',
      result: 'ALLOW',
      ip: '127.0.0.1',
      userAgent: 'LINE/13',
    })
    expect(arg?.data.metadata).toEqual({ shift: '00-06' })
  })

  test('defaults result to ALLOW and nullable fields to null', async () => {
    const prisma = mockPrisma()
    const audit = createAudit({ prisma: prisma as never })

    await audit({
      userId: null,
      action: 'AUTH:anon_attempt',
      resource: 'login',
    })

    const arg = prisma.auditLog.create.mock.calls[0]?.[0]
    expect(arg?.data.result).toBe('ALLOW')
    expect(arg?.data.ip).toBeNull()
    expect(arg?.data.userAgent).toBeNull()
  })
})

describe('audit — failure handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('swallows DB error and logs to console.error', async () => {
    const prisma = {
      auditLog: {
        create: vi.fn().mockRejectedValue(new Error('connection refused')),
      },
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const audit = createAudit({ prisma: prisma as never })

    await expect(
      audit({ userId: 'user_1', action: 'WRITE:roster', resource: 'roster:1' }),
    ).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0]?.[0]).toContain('[audit] failed')
  })
})
