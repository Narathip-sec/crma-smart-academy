// @vitest-environment node
import { beforeEach, describe, expect, test } from 'vitest'

// 32 raw bytes, base64url encoded.
const TEST_ENCRYPTION_KEY = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8'
const TEST_HMAC_KEY = 'IBshHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs'

beforeEach(() => {
  process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY
  process.env.HMAC_KEY = TEST_HMAC_KEY
})

describe('lib/crypto — hmacEmail', () => {
  test('deterministic for the same input', async () => {
    const { hmacEmail } = await import('@/lib/crypto')
    const a = await hmacEmail('cadet@crma.ac.th')
    const b = await hmacEmail('cadet@crma.ac.th')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  test('different inputs produce different hashes', async () => {
    const { hmacEmail } = await import('@/lib/crypto')
    expect(await hmacEmail('a@crma.ac.th')).not.toBe(await hmacEmail('b@crma.ac.th'))
  })

  test('changing the HMAC_KEY produces a different hash', async () => {
    const { hmacEmail } = await import('@/lib/crypto')
    const a = await hmacEmail('cadet@crma.ac.th')
    process.env.HMAC_KEY = 'PA0-Pj9AQUJDRERGR0hJSktMTU5PUFFSU1RVVldYWVo'
    const reloaded = await import('@/lib/crypto')
    const b = await reloaded.hmacEmail('cadet@crma.ac.th')
    expect(b).not.toBe(a)
  })

  test('missing HMAC_KEY throws', async () => {
    delete process.env.HMAC_KEY
    const fresh = await import('@/lib/crypto')
    await expect(fresh.hmacEmail('cadet@crma.ac.th')).rejects.toThrow(/HMAC_KEY/)
  })
})

describe('lib/crypto — normaliseEmail', () => {
  test('trim + lowercase', async () => {
    const { normaliseEmail } = await import('@/lib/crypto')
    expect(normaliseEmail('  Cadet@CRMA.ac.th  ')).toBe('cadet@crma.ac.th')
  })

  test('hmacEmail is case-insensitive after normalise', async () => {
    const { hmacEmail, normaliseEmail } = await import('@/lib/crypto')
    expect(await hmacEmail(normaliseEmail('CADET@crma.AC.th'))).toBe(
      await hmacEmail(normaliseEmail('cadet@crma.ac.th')),
    )
  })
})

describe('lib/crypto — encrypt / decrypt round-trip', () => {
  test('decrypt(encrypt(x)) === x', async () => {
    const { encrypt, decrypt } = await import('@/lib/crypto')
    const plaintext = 'cadet.narathip@crma.ac.th'
    const envelope = await encrypt(plaintext)
    expect(envelope).not.toBe(plaintext)
    expect(envelope).toMatch(/^[A-Za-z0-9_-]+$/) // base64url
    const back = await decrypt(envelope)
    expect(back).toBe(plaintext)
  })

  test('two encrypts of the same plaintext produce different ciphertexts (random IV)', async () => {
    const { encrypt } = await import('@/lib/crypto')
    const a = await encrypt('hello')
    const b = await encrypt('hello')
    expect(a).not.toBe(b)
  })

  test('tampered envelope rejected', async () => {
    const { encrypt, decrypt } = await import('@/lib/crypto')
    const envelope = await encrypt('cadet@crma.ac.th')
    const tampered = envelope.slice(0, -4) + 'AAAA'
    await expect(decrypt(tampered)).rejects.toThrow()
  })

  test('missing ENCRYPTION_KEY throws on encrypt', async () => {
    delete process.env.ENCRYPTION_KEY
    const fresh = await import('@/lib/crypto')
    await expect(fresh.encrypt('x')).rejects.toThrow(/ENCRYPTION_KEY/)
  })
})
