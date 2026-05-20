// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

import { createMeExportHandler } from '@/app/api/me/export/handler'

import type { Role } from '@prisma/client'

function build(userId?: string | null) {
  const headers: Record<string, string> = {}
  if (userId) headers['x-user-id'] = userId
  return new NextRequest(new URL('http://localhost/api/me/export'), {
    method: 'GET',
    headers,
  })
}

function fakeUser(overrides: Partial<{ emailCiphertext: string | null }> = {}) {
  return {
    id: 'user_1',
    cadetId: 'CDT-001',
    emailHash: 'hash',
    emailCiphertext: 'envelope::abc',
    emailVerified: new Date('2026-01-01T00:00:00Z'),
    lineUserId: 'Uabc',
    displayName: 'Narathip Chetjai',
    avatarUrl: null,
    role: 'CADET' as Role,
    company: '128',
    year: 3,
    totpSecret: 'encrypted',
    totpVerified: new Date('2026-01-02T00:00:00Z'),
    lastTotpStep: 12345n,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  }
}

function setup(opts?: {
  user?: ReturnType<typeof fakeUser> | null
  decryptResult?: string
  decryptError?: Error
}) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const decrypt = opts?.decryptError
    ? vi.fn().mockRejectedValue(opts.decryptError)
    : vi.fn().mockResolvedValue(opts?.decryptResult ?? 'cadet1@crma.ac.th')

  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue(opts && 'user' in opts ? opts.user : fakeUser()),
    },
    auditLog: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'log_1',
          userId: 'user_1',
          action: 'AUTH:line_callback',
          resource: 'user:user_1',
          result: 'ALLOW',
          ip: '127.0.0.1',
          userAgent: 'LINE/13',
          metadata: { branch: 'ok' },
          createdAt: new Date('2026-05-01T00:00:00Z'),
        },
      ]),
    },
  }

  const handler = createMeExportHandler({
    prisma: prisma as never,
    audit,
    decrypt,
  })
  return { audit, decrypt, handler, prisma }
}

describe('GET /api/me/export — auth gate', () => {
  test('401 + audit DENY when x-user-id missing', async () => {
    const { audit, handler } = setup()
    const res = await handler(build())
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PDPA:export', result: 'DENY' }),
    )
  })

  test('404 + audit DENY when user row not found', async () => {
    const { audit, handler } = setup({ user: null })
    const res = await handler(build('user_1'))
    expect(res.status).toBe(404)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PDPA:export',
        result: 'DENY',
        metadata: expect.objectContaining({ reason: 'user_not_found' }),
      }),
    )
  })
})

describe('GET /api/me/export — happy path', () => {
  test('200 returns user bundle with decrypted email + audit log + AuditLog row', async () => {
    const { audit, decrypt, handler } = setup()
    const res = await handler(build('user_1'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')
    expect(res.headers.get('content-disposition')).toContain('crma-export-CDT-001-')

    const body = (await res.json()) as {
      user: { id: string; email: string; emailDecryptError: string | null; totpEnrolled: boolean }
      auditLogs: Array<{ id: string }>
    }
    expect(body.user.id).toBe('user_1')
    expect(body.user.email).toBe('cadet1@crma.ac.th')
    expect(body.user.emailDecryptError).toBeNull()
    expect(body.user.totpEnrolled).toBe(true)
    expect(body.auditLogs).toHaveLength(1)
    expect(body.auditLogs[0]?.id).toBe('log_1')

    expect(decrypt).toHaveBeenCalledWith('envelope::abc')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PDPA:export',
        result: 'ALLOW',
        metadata: expect.objectContaining({ auditRowCount: 1 }),
      }),
    )
  })

  test('200 ships emailDecryptError when decryption fails (bundle still returned)', async () => {
    const { handler } = setup({ decryptError: new Error('bad_key') })
    const res = await handler(build('user_1'))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: { email: string | null; emailDecryptError: string } }
    expect(body.user.email).toBeNull()
    expect(body.user.emailDecryptError).toBe('bad_key')
  })

  test('200 omits decrypt call when emailCiphertext is null', async () => {
    const { decrypt, handler } = setup({ user: fakeUser({ emailCiphertext: null }) })
    const res = await handler(build('user_1'))
    expect(res.status).toBe(200)
    expect(decrypt).not.toHaveBeenCalled()
    const body = (await res.json()) as { user: { email: string | null } }
    expect(body.user.email).toBeNull()
  })
})
