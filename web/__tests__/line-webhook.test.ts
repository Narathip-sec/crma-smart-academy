// @vitest-environment node
import { createHmac } from 'node:crypto'

import { describe, expect, test } from 'vitest'

import { verifyLineSignature } from '@/lib/line-webhook'

const SECRET = 'channel-secret-for-tests'

function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64')
}

describe('verifyLineSignature', () => {
  test('accepts a valid HMAC-SHA-256 / base64 signature', () => {
    const body = '{"events":[]}'
    const sig = sign(body)
    expect(verifyLineSignature(body, sig, SECRET)).toBe(true)
  })

  test('rejects a tampered body even with valid old signature', () => {
    const sig = sign('{"events":[]}')
    expect(verifyLineSignature('{"events":[{"type":"follow"}]}', sig, SECRET)).toBe(false)
  })

  test('rejects when signature header is missing', () => {
    expect(verifyLineSignature('{}', null, SECRET)).toBe(false)
    expect(verifyLineSignature('{}', undefined, SECRET)).toBe(false)
    expect(verifyLineSignature('{}', '', SECRET)).toBe(false)
  })

  test('rejects a signature signed with the wrong secret', () => {
    const body = '{"events":[]}'
    const sig = sign(body, 'attacker-secret')
    expect(verifyLineSignature(body, sig, SECRET)).toBe(false)
  })

  test('rejects when signature length differs from expected HMAC', () => {
    const body = '{}'
    expect(verifyLineSignature(body, 'aGVsbG8=', SECRET)).toBe(false)
  })
})
