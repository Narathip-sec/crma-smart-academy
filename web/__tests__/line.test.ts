// @vitest-environment node
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { createLineVerifier } from '@/lib/line'

const CHANNEL_ID = '1234567890'
const ISSUER = 'https://access.line.me'

type Keypair = {
  privateKey: CryptoKey
  // Local JWKS containing only the public key.
  jwks: ReturnType<typeof createLocalJWKSet>
}

let keys: Keypair

async function makeKeys(): Promise<Keypair> {
  const { privateKey, publicKey } = await generateKeyPair('ES256', { extractable: true })
  const jwk = await exportJWK(publicKey)
  jwk.alg = 'ES256'
  jwk.kid = 'test-kid-1'
  return {
    privateKey,
    jwks: createLocalJWKSet({ keys: [jwk] }),
  }
}

async function signLineToken(opts: {
  privateKey: CryptoKey
  sub?: string
  name?: string
  picture?: string
  email?: string
  audience?: string
  issuer?: string
  expSeconds?: number
  iatOffsetSeconds?: number
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000) + (opts.iatOffsetSeconds ?? 0)
  return new SignJWT({
    name: opts.name ?? 'Cadet Test',
    picture: opts.picture,
    email: opts.email,
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'test-kid-1' })
    .setSubject(opts.sub ?? 'Uabcdef1234567890')
    .setIssuer(opts.issuer ?? ISSUER)
    .setAudience(opts.audience ?? CHANNEL_ID)
    .setIssuedAt(now)
    .setExpirationTime(now + (opts.expSeconds ?? 3600))
    .sign(opts.privateKey)
}

beforeAll(async () => {
  keys = await makeKeys()
})

beforeEach(() => {
  process.env.LINE_CHANNEL_ID = CHANNEL_ID
})

describe('lib/line — verifyLineIdToken', () => {
  test('valid token returns profile', async () => {
    const token = await signLineToken({
      privateKey: keys.privateKey,
      name: 'Cadet One',
      picture: 'https://example/p.png',
      email: 'cadet@line.example',
    })
    const verify = createLineVerifier({ jwks: keys.jwks })
    const profile = await verify(token)
    expect(profile.lineUserId).toBe('Uabcdef1234567890')
    expect(profile.displayName).toBe('Cadet One')
    expect(profile.picture).toBe('https://example/p.png')
    expect(profile.email).toBe('cadet@line.example')
  })

  test('missing email/picture claims still works (optional)', async () => {
    const token = await signLineToken({ privateKey: keys.privateKey })
    const verify = createLineVerifier({ jwks: keys.jwks })
    const profile = await verify(token)
    expect(profile.email).toBeUndefined()
    expect(profile.picture).toBeUndefined()
  })

  test('wrong audience rejected', async () => {
    const token = await signLineToken({
      privateKey: keys.privateKey,
      audience: 'some-other-channel',
    })
    const verify = createLineVerifier({ jwks: keys.jwks })
    await expect(verify(token)).rejects.toThrow()
  })

  test('wrong issuer rejected', async () => {
    const token = await signLineToken({
      privateKey: keys.privateKey,
      issuer: 'https://evil.example',
    })
    const verify = createLineVerifier({ jwks: keys.jwks })
    await expect(verify(token)).rejects.toThrow()
  })

  test('expired token rejected', async () => {
    const token = await signLineToken({
      privateKey: keys.privateKey,
      iatOffsetSeconds: -3700,
      expSeconds: 60,
    })
    const verify = createLineVerifier({ jwks: keys.jwks })
    await expect(verify(token)).rejects.toThrow()
  })

  test('missing LINE_CHANNEL_ID env throws', async () => {
    delete process.env.LINE_CHANNEL_ID
    const token = await signLineToken({ privateKey: keys.privateKey })
    const verify = createLineVerifier({ jwks: keys.jwks })
    await expect(verify(token)).rejects.toThrow(/LINE_CHANNEL_ID/)
  })

  test('empty token string rejected', async () => {
    const verify = createLineVerifier({ jwks: keys.jwks })
    await expect(verify('')).rejects.toThrow()
  })
})
