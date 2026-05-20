// POST /api/auth/email/start
// Reads the __Host-crma-enrol cookie, accepts an @crma.ac.th email,
// rate-limits to 1 send per 60 s, persists an EmailOtp row, and dispatches
// the code via Brevo. Factory + handler split mirrors the LINE callback so
// unit tests can inject prisma + send + audit + verify mocks.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { encrypt, hmacEmail, normaliseEmail } from '@/lib/crypto'
import { sendOtpEmail as defaultSendOtpEmail } from '@/lib/email'
import { createOtpService } from '@/lib/email-otp'
import { prisma as defaultPrisma } from '@/lib/prisma'
import {
  ENROL_COOKIE,
  type EnrolPayload,
  verifyEnrolToken as defaultVerifyEnrolToken,
} from '@/lib/session'

import type { PrismaClient } from '@prisma/client'

const EMAIL_REGEX = /^[^@\s]+@crma\.ac\.th$/

export type EmailStartDeps = {
  prisma: Pick<PrismaClient, 'user' | 'emailOtp'>
  verifyEnrolToken: (token: string) => Promise<EnrolPayload>
  sendOtpEmail: typeof defaultSendOtpEmail
  audit: typeof defaultAudit
}

type StartBody = { email: string }

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

export function createEmailStartHandler(deps: EmailStartDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    // Enrol cookie gate.
    const token = req.cookies.get(ENROL_COOKIE)?.value
    if (!token) {
      await deps.audit({
        userId: null,
        action: 'AUTH:email_start',
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
        action: 'AUTH:email_start',
        resource: 'enrol:cookie',
        result: 'DENY',
        ip,
        userAgent,
      })
      return json(401, { error: 'enrol_invalid' })
    }

    // Body shape + email gate.
    let body: Partial<StartBody> | null = null
    try {
      body = (await req.json()) as Partial<StartBody>
    } catch {
      body = null
    }
    const raw = typeof body?.email === 'string' ? body.email : ''
    const email = normaliseEmail(raw)
    if (!EMAIL_REGEX.test(email)) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_start',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'bad_email' },
      })
      return json(400, { error: 'bad_email' })
    }

    const emailHash = await hmacEmail(email)

    // Conflict guard: another user already verified this institutional address.
    const owner = await deps.prisma.user.findUnique({ where: { emailHash } })
    if (owner && owner.id !== enrol.sub) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_start',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'email_in_use' },
      })
      return json(409, { error: 'email_in_use' })
    }

    const otp = createOtpService({ prisma: deps.prisma as never })

    // Per-user 60-second rate-limit.
    const gate = await otp.canSendAgain({ userId: enrol.sub })
    if (!gate.ok) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_start',
        resource: `user:${enrol.sub}`,
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: 'rate_limited' },
      })
      return json(429, { error: 'rate_limited', retryAt: gate.retryAt })
    }

    const emailCiphertext = await encrypt(email)
    const { code, expiresAt } = await otp.issue({
      userId: enrol.sub,
      emailHash,
      emailCiphertext,
    })
    const send = await deps.sendOtpEmail({ to: email, code })
    if (!send.ok) {
      await deps.audit({
        userId: enrol.sub,
        action: 'AUTH:email_start',
        resource: `user:${enrol.sub}`,
        result: 'ERROR',
        ip,
        userAgent,
        metadata: { reason: send.reason },
      })
      return json(502, { error: 'send_failed' })
    }

    await deps.audit({
      userId: enrol.sub,
      action: 'AUTH:email_start',
      resource: `user:${enrol.sub}`,
      result: 'ALLOW',
      ip,
      userAgent,
    })
    return json(200, { ok: true, expiresAt })
  }
}

export const defaultEmailStartHandler = createEmailStartHandler({
  prisma: defaultPrisma,
  verifyEnrolToken: defaultVerifyEnrolToken,
  sendOtpEmail: defaultSendOtpEmail,
  audit: defaultAudit,
})
