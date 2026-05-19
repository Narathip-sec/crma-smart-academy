import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

export type LineProfile = {
  lineUserId: string
  displayName: string
  picture?: string
  email?: string
}

type Jwks = Awaited<ReturnType<typeof createRemoteJWKSet>> | ((...args: never[]) => unknown)

const LINE_ISSUER = 'https://access.line.me'
const DEFAULT_JWKS_URL = 'https://api.line.me/oauth2/v2.1/certs'

function defaultRemoteJwks(): Jwks {
  const url = new URL(process.env.LINE_JWKS_URL ?? DEFAULT_JWKS_URL)
  return createRemoteJWKSet(url)
}

export function createLineVerifier(opts?: { jwks?: Jwks }) {
  // Construct the default JWKs lazily so importing this module never
  // initiates a network fetch — only the first verify call triggers it.
  let jwks: Jwks | null = opts?.jwks ?? null

  return async function verifyLineIdToken(idToken: string): Promise<LineProfile> {
    const channelId = process.env.LINE_CHANNEL_ID
    if (!channelId) {
      throw new Error('LINE_CHANNEL_ID env var is required')
    }
    if (!idToken) {
      throw new Error('idToken is required')
    }
    if (!jwks) jwks = defaultRemoteJwks()

    const { payload } = await jwtVerify(idToken, jwks as never, {
      issuer: LINE_ISSUER,
      audience: channelId,
      algorithms: ['ES256'],
    })

    return toProfile(payload)
  }
}

function toProfile(payload: JWTPayload): LineProfile {
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new Error('LINE id token missing sub claim')
  }
  const name = (payload as { name?: unknown }).name
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('LINE id token missing name claim')
  }
  const pictureRaw = (payload as { picture?: unknown }).picture
  const emailRaw = (payload as { email?: unknown }).email
  return {
    lineUserId: payload.sub,
    displayName: name,
    picture: typeof pictureRaw === 'string' ? pictureRaw : undefined,
    email: typeof emailRaw === 'string' ? emailRaw : undefined,
  }
}

// Default singleton — lazy, never fetches at import time.
export const verifyLineIdToken = createLineVerifier()
