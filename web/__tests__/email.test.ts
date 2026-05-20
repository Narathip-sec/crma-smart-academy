// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { sendOtpEmail } from '@/lib/email'

const ORIGINAL_FETCH = globalThis.fetch

beforeEach(() => {
  delete process.env.BREVO_API_KEY
})

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH
  vi.restoreAllMocks()
})

describe('lib/email — dev fallback (no BREVO_API_KEY)', () => {
  test('logs the code and returns ok without hitting the network', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as never

    const out = await sendOtpEmail({ to: 'cadet@crma.ac.th', code: '123456' })

    expect(out).toEqual({ ok: true, reason: 'noop:dev_fallback' })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledTimes(1)
    const line = String(logSpy.mock.calls[0]?.[0] ?? '')
    expect(line).toContain('[email]')
    expect(line).toContain('123456')
    expect(line).toContain('cadet@crma.ac.th')
  })
})

describe('lib/email — Brevo call (BREVO_API_KEY present)', () => {
  test('POSTs to Brevo with sender + recipient + code in body', async () => {
    process.env.BREVO_API_KEY = 'test_brevo_key'
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 201 }))
    globalThis.fetch = fetchSpy as never

    const out = await sendOtpEmail({ to: 'cadet@crma.ac.th', code: '987654' })
    expect(out).toEqual({ ok: true })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const call = fetchSpy.mock.calls[0] as [unknown, RequestInit] | undefined
    if (!call) throw new Error('fetch not called')
    const [url, init] = call
    expect(String(url)).toBe('https://api.brevo.com/v3/smtp/email')
    const headers = init.headers as Record<string, string>
    expect(headers['api-key']).toBe('test_brevo_key')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Accept).toBe('application/json')

    const body = JSON.parse(String(init.body ?? '{}'))
    expect(body.sender?.name).toBe('CRMA Smart Academy')
    expect(body.to?.[0]?.email).toBe('cadet@crma.ac.th')
    expect(body.subject).toMatch(/CRMA verification code/i)
    expect(body.textContent).toContain('987654')
  })

  test('non-2xx → ok: false + reason includes status', async () => {
    process.env.BREVO_API_KEY = 'test_brevo_key'
    globalThis.fetch = (async () => new Response('rate limited', { status: 429 })) as never

    const out = await sendOtpEmail({ to: 'cadet@crma.ac.th', code: '111111' })
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.reason).toMatch(/429/)
  })

  test('fetch throws → ok: false + reason carries the message', async () => {
    process.env.BREVO_API_KEY = 'test_brevo_key'
    globalThis.fetch = (async () => {
      throw new Error('boom')
    }) as never

    const out = await sendOtpEmail({ to: 'cadet@crma.ac.th', code: '222222' })
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.reason).toMatch(/boom/)
  })
})
