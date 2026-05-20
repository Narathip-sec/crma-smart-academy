// POST /api/auth/totp/enrol/start
// Reads __Host-crma-enrol, generates a fresh TOTP secret, encrypts it
// onto User.totpSecret, and returns the otpauth URI + QR data URL the
// authenticator app needs. Factory + handler split mirrors the email
// enrol routes so tests can inject prisma / verifyEnrolToken / totp lib
// / audit without touching the singleton wiring in route.ts.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { encrypt as defaultEncrypt } from '@/lib/crypto'
import { prisma as defaultPrisma } from '@/lib/prisma'
import {
  ENROL_COOKIE,
  type EnrolPayload,
  verifyEnrolToken as defaultVerifyEnrolToken,
} from '@/lib/session'
import {
  buildOtpAuthUri as defaultBuildOtpAuthUri,
  buildQrDataUrl as defaultBuildQrDataUrl,
  generateSecret as defaultGenerateSecret,
} from '@/lib/totp'

import type { PrismaClient } from '@prisma/client'

export type TotpStartDeps = {
  prisma: Pick<PrismaClient, 'user'>
  verifyEnrolToken: (token: string) => Promise<EnrolPayload>
  encrypt: typeof defaultEncrypt
  generateSecret: typeof defaultGenerateSecret
  buildOtpAuthUri: typeof defaultBuildOtpAuthUri
  buildQrDataUrl: typeof defaultBuildQrDataUrl
  audit: typeof defaultAudit
}

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

export function createTotpStartHandler(deps: TotpStartDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    const token = req.cookies.get(ENROL_COOKIE)?.value
    if (!token) {
      await deps.audit({
        userId: null,
        action: 'AUTH:totp_enrol_start',
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
        action: 'AUTH:totp_enrol_start',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_invalid' })
    }

    const user = await deps.prisma.user.findUnique({ where: { id: enrol.sub } })
    if (!user) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:totp_enrol_start',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'user_missing' },
      })
      return json(404, { error: 'user_missing' })
    }

    if (user.totpVerified) {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:totp_enrol_start',
        resource: `user:${user.id}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'already_enrolled' },
      })
      return json(409, { error: 'already_enrolled' })
    }

    const secret = deps.generateSecret()
    const ciphertext = await deps.encrypt(secret)
    await deps.prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: ciphertext },
    })

    const otpAuthUri = deps.buildOtpAuthUri({ secret, account: user.cadetId })
    const qrDataUrl = await deps.buildQrDataUrl(otpAuthUri)

    await deps.audit({
      userId: user.id,
      action: 'AUTH:totp_enrol_start',
      resource: `user:${user.id}`,
      result: 'ALLOW',
      ip,
      userAgent,
    })

    return json(200, { ok: true, otpAuthUri, qrDataUrl })
  }
}

export const defaultTotpStartHandler = createTotpStartHandler({
  prisma: defaultPrisma,
  verifyEnrolToken: defaultVerifyEnrolToken,
  encrypt: defaultEncrypt,
  generateSecret: defaultGenerateSecret,
  buildOtpAuthUri: defaultBuildOtpAuthUri,
  buildQrDataUrl: defaultBuildQrDataUrl,
  audit: defaultAudit,
})
