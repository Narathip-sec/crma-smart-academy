// POST /api/auth/email/verify
// Validates the 6-digit OTP for the enrol-cookie user, copies the verified
// emailHash + emailCiphertext from the OTP row onto the User record, sets
// emailVerified, and returns the next enrolment step. Factory + handler
// split mirrors the /start route.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { createOtpService } from '@/lib/email-otp'
import { prisma as defaultPrisma } from '@/lib/prisma'
import {
  ENROL_COOKIE,
  type EnrolPayload,
  verifyEnrolToken as defaultVerifyEnrolToken,
} from '@/lib/session'

import type { PrismaClient } from '@prisma/client'

export type EmailVerifyDeps = {
  prisma: Pick<PrismaClient, 'user' | 'emailOtp'>
  verifyEnrolToken: (token: string) => Promise<EnrolPayload>
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

export function createEmailVerifyHandler(deps: EmailVerifyDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    // Enrol cookie gate.
    const token = req.cookies.get(ENROL_COOKIE)?.value
    if (!token) {
      await deps.audit({
        userId: null,
        action: 'AUTH:email_verify',
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
        action: 'AUTH:email_verify',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_invalid' })
    }

    // Body shape.
    let body: Partial<VerifyBody> | null = null
    try {
      body = (await req.json()) as Partial<VerifyBody>
    } catch {
      body = null
    }
    if (typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_verify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'bad_code' },
      })
      return json(400, { error: 'bad_code' })
    }

    const otp = createOtpService({ prisma: deps.prisma as never })
    const result = await otp.verify({ userId: enrol.sub, code: body.code })

    if (!result.ok) {
      const statusByReason: Record<typeof result.reason, number> = {
        not_found: 404,
        expired: 410,
        mismatch: 401,
        attempts_exceeded: 429,
      }
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_verify',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: result.reason },
      })
      return json(statusByReason[result.reason], { error: result.reason })
    }

    // Promote OTP row → user record. emailHash uniqueness is already
    // enforced by /start's email_in_use check; if a race smuggles one
    // in, the unique constraint will surface as a 500 from prisma.
    const updated = await deps.prisma.user.update({
      where: { id: enrol.sub },
      data: {
        emailHash: result.emailHash,
        emailCiphertext: result.emailCiphertext,
        emailVerified: new Date(),
      },
    })

    await deps.audit({
      userId: enrol.sub,
      action: 'AUTH:email_verify',
      resource: `user:${enrol.sub}`,
      result: 'ALLOW',
      ip,
      userAgent,
    })

    return json(200, {
      status: updated.totpSecret ? 'ok' : 'needs_totp',
    })
  }
}

export const defaultEmailVerifyHandler = createEmailVerifyHandler({
  prisma: defaultPrisma,
  verifyEnrolToken: defaultVerifyEnrolToken,
  audit: defaultAudit,
})
