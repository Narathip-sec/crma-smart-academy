// POST /api/auth/totp/reverify
// Phase 2e re-verify path. Cadet already finished email + TOTP
// enrolment on some device; this route gates a new device fingerprint
// by demanding a fresh authenticator code. On success, persists a
// RefreshToken row for the new device, mints access + refresh cookies,
// clears the enrol cookie. Replay-aware via lib/totp.consumeCode.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { decrypt as defaultDecrypt } from '@/lib/crypto'
import { prisma as defaultPrisma } from '@/lib/prisma'
import {
  buildAccessCookie,
  buildRefreshCookie,
  clearEnrolCookie,
  ENROL_COOKIE,
  type EnrolPayload,
  signAccessToken,
  signRefreshToken,
  verifyEnrolToken as defaultVerifyEnrolToken,
} from '@/lib/session'
import { consumeCode as defaultConsumeCode } from '@/lib/totp'

import type { PrismaClient } from '@prisma/client'

export type TotpReverifyDeps = {
  prisma: Pick<PrismaClient, 'user' | 'refreshToken'>
  verifyEnrolToken: (token: string) => Promise<EnrolPayload>
  decrypt: typeof defaultDecrypt
  consumeCode: typeof defaultConsumeCode
  audit: typeof defaultAudit
}

type ReverifyBody = { code: string }

function reqHeaders(req: NextRequest) {
  return {
    ip:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null,
    userAgent: req.headers.get('user-agent') ?? null,
  }
}

function json(status: number, body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export function createTotpReverifyHandler(deps: TotpReverifyDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    const token = req.cookies.get(ENROL_COOKIE)?.value
    if (!token) {
      await deps.audit({
        userId: null,
        action: 'AUTH:totp_reverify',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_required' })
    }

    let enrol: EnrolPayload
    try {
      enrol = await deps.verifyEnrolToken(token)
    } catch {
      await deps.audit({
        userId: null,
        action: 'AUTH:totp_reverify',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_invalid' })
    }

    let body: Partial<ReverifyBody> | null = null
    try {
      body = (await req.json()) as Partial<ReverifyBody>
    } catch {
      body = null
    }
    if (typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:totp_reverify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'bad_code' },
      })
      return json(400, { error: 'bad_code' })
    }

    const user = await deps.prisma.user.findUnique({ where: { id: enrol.sub } })
    if (!user || !user.totpSecret || !user.totpVerified) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:totp_reverify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'not_enrolled' },
      })
      return json(409, { error: 'not_enrolled' })
    }

    let secret: string
    try {
      secret = await deps.decrypt(user.totpSecret)
    } catch {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:totp_reverify',
        resource: `user:${user.id}`,
        result: 'ERROR',
        ip,
        userAgent,
        metadata: { reason: 'decrypt_failed' },
      })
      return json(500, { error: 'decrypt_failed' })
    }

    const result = deps.consumeCode({
      secret,
      code: body.code,
      lastStep: user.lastTotpStep ?? null,
    })
    if (!result.ok) {
      const status = result.reason === 'replay' ? 409 : 401
      await deps.audit({
        userId: user.id,
        action: 'AUTH:totp_reverify',
        resource: `user:${user.id}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: result.reason },
      })
      return json(status, { error: result.reason })
    }

    await deps.prisma.user.update({
      where: { id: user.id },
      data: { lastTotpStep: result.step },
    })

    const sessionPayload = {
      sub: user.id,
      role: user.role,
      cadetId: user.cadetId,
      deviceFp: enrol.deviceFp,
    }
    const access = await signAccessToken(sessionPayload)
    const refresh = await signRefreshToken(sessionPayload)

    await deps.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refresh.hash,
        deviceFp: enrol.deviceFp,
        expiresAt: refresh.expiresAt,
      },
    })

    await deps.audit({
      userId: user.id,
      action: 'AUTH:totp_reverify',
      resource: `user:${user.id}`,
      result: 'ALLOW',
      ip,
      userAgent,
    })

    const res = json(200, { status: 'ok' })
    res.headers.append('set-cookie', buildAccessCookie(access))
    res.headers.append('set-cookie', buildRefreshCookie(refresh.token))
    res.headers.append('set-cookie', clearEnrolCookie())
    return res
  }
}

export const defaultTotpReverifyHandler = createTotpReverifyHandler({
  prisma: defaultPrisma,
  verifyEnrolToken: defaultVerifyEnrolToken,
  decrypt: defaultDecrypt,
  consumeCode: defaultConsumeCode,
  audit: defaultAudit,
})
