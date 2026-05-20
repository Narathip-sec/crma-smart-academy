// POST /api/auth/totp/enrol/verify
// Final step of the enrolment loop. Decrypts the stored TOTP secret,
// validates the 6-digit code with ±1 step skew, stamps User.totpVerified,
// mints the final access + refresh cookies, persists the RefreshToken
// row, and clears the enrol cookie in the same response.

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
import { verifyCode as defaultVerifyCode } from '@/lib/totp'

import type { PrismaClient } from '@prisma/client'

export type TotpVerifyDeps = {
  prisma: Pick<PrismaClient, 'user' | 'refreshToken'>
  verifyEnrolToken: (token: string) => Promise<EnrolPayload>
  decrypt: typeof defaultDecrypt
  verifyCode: typeof defaultVerifyCode
  audit: typeof defaultAudit
}

type VerifyBody = { code: string }

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

export function createTotpVerifyHandler(deps: TotpVerifyDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    const token = req.cookies.get(ENROL_COOKIE)?.value
    if (!token) {
      await deps.audit({
        userId: null,
        action: 'AUTH:totp_enrol_verify',
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
        action: 'AUTH:totp_enrol_verify',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_invalid' })
    }

    let body: Partial<VerifyBody> | null = null
    try {
      body = (await req.json()) as Partial<VerifyBody>
    } catch {
      body = null
    }
    if (typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:totp_enrol_verify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'bad_code' },
      })
      return json(400, { error: 'bad_code' })
    }

    const user = await deps.prisma.user.findUnique({ where: { id: enrol.sub } })
    if (!user || !user.totpSecret) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:totp_enrol_verify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'enrol_not_started' },
      })
      return json(409, { error: 'enrol_not_started' })
    }

    let secret: string
    try {
      secret = await deps.decrypt(user.totpSecret)
    } catch {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:totp_enrol_verify',
        resource: `user:${user.id}`,
        result: 'ERROR',
        ip,
        userAgent,
        metadata: { reason: 'decrypt_failed' },
      })
      return json(500, { error: 'decrypt_failed' })
    }

    if (!deps.verifyCode({ secret, code: body.code })) {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:totp_enrol_verify',
        resource: `user:${user.id}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'invalid_code' },
      })
      return json(401, { error: 'invalid_code' })
    }

    await deps.prisma.user.update({
      where: { id: user.id },
      data: { totpVerified: new Date() },
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
      action: 'AUTH:totp_enrol_verify',
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

export const defaultTotpVerifyHandler = createTotpVerifyHandler({
  prisma: defaultPrisma,
  verifyEnrolToken: defaultVerifyEnrolToken,
  decrypt: defaultDecrypt,
  verifyCode: defaultVerifyCode,
  audit: defaultAudit,
})
