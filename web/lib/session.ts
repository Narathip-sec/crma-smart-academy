import { createHash, randomUUID } from 'node:crypto'

import { jwtVerify, SignJWT } from 'jose'

import type { Role } from '@prisma/client'

export type SessionPayload = {
  sub: string
  role: Role
  cadetId: string
  email: string
  deviceFp: string
}

const ISSUER = 'crma-smart-academy'
const ACCESS_AUDIENCE = 'crma-access'
const REFRESH_AUDIENCE = 'crma-refresh'
const ACCESS_TTL_SECONDS = 60 * 60 // 1h
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60 // 30d

export const ACCESS_COOKIE = '__Host-crma-access'
export const REFRESH_COOKIE = '__Host-crma-refresh'

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET
  if (!raw) throw new Error('JWT_SECRET env var is required')
  if (raw.length < 32) throw new Error('JWT_SECRET must be >= 32 bytes for HS256')
  return new TextEncoder().encode(raw)
}

async function sign(
  payload: SessionPayload,
  audience: string,
  ttlSeconds: number,
): Promise<string> {
  return new SignJWT({
    role: payload.role,
    cadetId: payload.cadetId,
    email: payload.email,
    deviceFp: payload.deviceFp,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setJti(randomUUID())
    .sign(getSecret())
}

async function verify(token: string, audience: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: ISSUER,
    audience,
    algorithms: ['HS256'],
  })
  if (typeof payload.sub !== 'string') throw new Error('invalid sub')
  if (typeof payload.role !== 'string') throw new Error('invalid role')
  if (typeof payload.cadetId !== 'string') throw new Error('invalid cadetId')
  if (typeof payload.email !== 'string') throw new Error('invalid email')
  if (typeof payload.deviceFp !== 'string') throw new Error('invalid deviceFp')
  return {
    sub: payload.sub,
    role: payload.role as Role,
    cadetId: payload.cadetId,
    email: payload.email,
    deviceFp: payload.deviceFp,
  }
}

export function signAccessToken(payload: SessionPayload): Promise<string> {
  return sign(payload, ACCESS_AUDIENCE, ACCESS_TTL_SECONDS)
}

export function verifyAccessToken(token: string): Promise<SessionPayload> {
  return verify(token, ACCESS_AUDIENCE)
}

export async function signRefreshToken(
  payload: SessionPayload,
): Promise<{ token: string; hash: string; expiresAt: Date }> {
  const token = await sign(payload, REFRESH_AUDIENCE, REFRESH_TTL_SECONDS)
  const hash = createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
  return { token, hash, expiresAt }
}

export function verifyRefreshToken(token: string): Promise<SessionPayload> {
  return verify(token, REFRESH_AUDIENCE)
}

function cookieAttrs(maxAgeSeconds: number): string {
  // __Host- prefix forbids Domain attribute, mandates Secure + Path=/.
  return ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAgeSeconds}`].join('; ')
}

export function buildAccessCookie(token: string): string {
  return `${ACCESS_COOKIE}=${token}; ${cookieAttrs(ACCESS_TTL_SECONDS)}`
}

export function buildRefreshCookie(token: string): string {
  return `${REFRESH_COOKIE}=${token}; ${cookieAttrs(REFRESH_TTL_SECONDS)}`
}

export function clearAuthCookies(): string[] {
  return [`${ACCESS_COOKIE}=; ${cookieAttrs(0)}`, `${REFRESH_COOKIE}=; ${cookieAttrs(0)}`]
}
