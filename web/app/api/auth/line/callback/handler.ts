// Factory + handler split so the unit test can inject mocks for
// prisma, verifier, and audit without touching the route module.
// The thin route.ts wires the singletons.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { hmacEmail, normaliseEmail } from '@/lib/crypto'
import { type LineProfile, verifyLineIdToken as defaultVerify } from '@/lib/line'
import { prisma as defaultPrisma } from '@/lib/prisma'
import {
  buildAccessCookie,
  buildEnrolCookie,
  buildRefreshCookie,
  signAccessToken,
  signEnrolToken,
  signRefreshToken,
} from '@/lib/session'

import type { PrismaClient } from '@prisma/client'

type CallbackDeps = {
  prisma: Pick<PrismaClient, 'user' | 'refreshToken'>
  verifyLineIdToken: (idToken: string) => Promise<LineProfile>
  audit: typeof defaultAudit
}

type CallbackBody = {
  idToken: string
  deviceFp: string
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

function badJson(status: number, body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export function createLineCallbackHandler(deps: CallbackDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    // Env gate.
    if (!process.env.LINE_CHANNEL_ID) {
      await deps.audit({
        userId: null,
        action: 'AUTH:line_callback',
        resource: 'line:env',
        result: 'ERROR',
        ip,
        userAgent,
      })
      return badJson(503, { error: 'liff_not_configured' })
    }

    // Body parse + shape validation.
    let body: Partial<CallbackBody> | null = null
    try {
      body = (await req.json()) as Partial<CallbackBody>
    } catch {
      body = null
    }
    if (!body || typeof body.idToken !== 'string' || typeof body.deviceFp !== 'string') {
      await deps.audit({
        userId: null,
        action: 'AUTH:line_callback',
        resource: 'line:body',
        result: 'DENY',
        ip,
        userAgent,
      })
      return badJson(400, { error: 'bad_request' })
    }

    // LINE ID token verification.
    let profile: LineProfile
    try {
      profile = await deps.verifyLineIdToken(body.idToken)
    } catch (err) {
      await deps.audit({
        userId: null,
        action: 'AUTH:line_callback',
        resource: 'line:verify',
        result: 'DENY',
        ip,
        userAgent,
        metadata: { reason: err instanceof Error ? err.message : 'unknown' },
      })
      return badJson(401, { error: 'invalid_token' })
    }

    // Compute the placeholder emailHash for new users. Phase 2c verify
    // overwrites it with the verified institutional email hash + ciphertext.
    const placeholderEmail = normaliseEmail(`pending:${profile.lineUserId}@crma.ac.th`)
    const placeholderEmailHash = await hmacEmail(placeholderEmail)

    // Upsert user keyed by lineUserId.
    const user = await deps.prisma.user.upsert({
      where: { lineUserId: profile.lineUserId },
      create: {
        cadetId: `pending:${profile.lineUserId}`,
        emailHash: placeholderEmailHash,
        lineUserId: profile.lineUserId,
        displayName: profile.displayName,
        avatarUrl: profile.picture ?? null,
      },
      update: {
        displayName: profile.displayName,
        avatarUrl: profile.picture ?? null,
      },
    })

    // Enrolment branches. Both pre-enrolment branches mint the short-lived
    // enrol cookie that unlocks /enrol/* + /api/auth/email/* until the
    // cadet finishes email + TOTP setup. See lib/session.ts.
    const enrolToken = await signEnrolToken({
      sub: user.id,
      lineUserId: profile.lineUserId,
      deviceFp: body.deviceFp,
    })

    if (!user.emailVerified) {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:line_callback',
        resource: `user:${user.id}`,
        result: 'ALLOW',
        ip,
        userAgent,
        metadata: { branch: 'needs_email' },
      })
      const res = NextResponse.json({ status: 'needs_email' })
      res.headers.append('set-cookie', buildEnrolCookie(enrolToken))
      return res
    }
    if (!user.totpVerified) {
      await deps.audit({
        userId: user.id,
        action: 'AUTH:line_callback',
        resource: `user:${user.id}`,
        result: 'ALLOW',
        ip,
        userAgent,
        metadata: { branch: 'needs_totp' },
      })
      const res = NextResponse.json({ status: 'needs_totp' })
      res.headers.append('set-cookie', buildEnrolCookie(enrolToken))
      return res
    }

    // Fully enroled → mint session. Email is not part of the JWT (see
    // lib/session.ts SessionPayload comment); routes look it up + decrypt
    // from user.emailCiphertext when needed.
    const sessionPayload = {
      sub: user.id,
      role: user.role,
      cadetId: user.cadetId,
      deviceFp: body.deviceFp,
    }
    const access = await signAccessToken(sessionPayload)
    const refresh = await signRefreshToken(sessionPayload)

    await deps.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refresh.hash,
        deviceFp: body.deviceFp,
        expiresAt: refresh.expiresAt,
      },
    })

    await deps.audit({
      userId: user.id,
      action: 'AUTH:line_callback',
      resource: `user:${user.id}`,
      result: 'ALLOW',
      ip,
      userAgent,
      metadata: { branch: 'ok' },
    })

    const res = NextResponse.json({ status: 'ok' })
    res.headers.append('set-cookie', buildAccessCookie(access))
    res.headers.append('set-cookie', buildRefreshCookie(refresh.token))
    return res
  }
}

export const defaultLineCallbackHandler = createLineCallbackHandler({
  prisma: defaultPrisma,
  verifyLineIdToken: defaultVerify,
  audit: defaultAudit,
})
