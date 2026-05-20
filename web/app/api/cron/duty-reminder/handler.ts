// Vercel Cron — daily duty reminder.
//
// Cadence: 22:00 Asia/Bangkok via vercel.json crons schedule. Vercel
// injects `Authorization: Bearer ${CRON_SECRET}` automatically when
// invoking the route, which we verify in constant fashion before
// taking any action. Anyone else hitting the endpoint gets 401 +
// an AuditLog row tagged DENY.
//
// On a valid request: look up duty cadets for today, multicast a
// reminder via the LINE Messaging API, and write a single AuditLog
// row summarising the send. The 0-cadets path is treated as success.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { getDutyCadetsForDate as defaultGetDuty } from '@/lib/duty-roster'
import { lineMessaging as defaultMessaging, type LineMessagingClient } from '@/lib/line-messaging'

export interface DutyReminderDeps {
  audit: typeof defaultAudit
  cronSecret: string | undefined
  getDutyCadets: typeof defaultGetDuty
  messaging: LineMessagingClient
  now?: () => Date
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

function jsonResponse(status: number, body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function dateKey(d: Date): string {
  // YYYY-MM-DD in UTC. Asia/Bangkok scheduling is on the cron side
  // — the date the cadets see in the message matches the date the
  // job runs in their TZ.
  return d.toISOString().slice(0, 10)
}

export function createDutyReminderHandler(deps: DutyReminderDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    if (!deps.cronSecret) {
      await deps.audit({
        userId: null,
        action: 'CRON:duty_reminder',
        resource: 'cron:env',
        result: 'ERROR',
        ip,
        userAgent,
      })
      return jsonResponse(503, { error: 'not_configured' })
    }

    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${deps.cronSecret}`) {
      await deps.audit({
        userId: null,
        action: 'CRON:duty_reminder',
        resource: 'cron:auth',
        result: 'DENY',
        ip,
        userAgent,
      })
      return jsonResponse(401, { error: 'unauthorized' })
    }

    const today = dateKey(deps.now?.() ?? new Date())
    const cadets = await deps.getDutyCadets(today)

    if (cadets.length === 0) {
      await deps.audit({
        userId: null,
        action: 'CRON:duty_reminder',
        resource: `cron:date:${today}`,
        result: 'ALLOW',
        ip,
        userAgent,
        metadata: { sent: 0, reason: 'no_cadets' },
      })
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const lineUserIds = cadets.map((c) => c.lineUserId)
    const result = await deps.messaging.multicast(lineUserIds, [
      {
        type: 'text',
        text: `[CRMA] เตือนความจำ: คุณมีหน้าที่เวรประจำวัน ${today} กรุณาตรวจสอบตารางและรายงานตัวตามกำหนด.`,
      },
    ])

    await deps.audit({
      userId: null,
      action: 'CRON:duty_reminder',
      resource: `cron:date:${today}`,
      result: result.ok ? 'ALLOW' : 'ERROR',
      ip,
      userAgent,
      metadata: {
        sent: cadets.length,
        ok: result.ok,
        reason: result.ok ? (result.reason ?? null) : result.reason,
      },
    })

    return NextResponse.json({ ok: true, sent: cadets.length })
  }
}

export const defaultDutyReminderHandler = createDutyReminderHandler({
  audit: defaultAudit,
  cronSecret: process.env.CRON_SECRET,
  getDutyCadets: defaultGetDuty,
  messaging: defaultMessaging,
})
