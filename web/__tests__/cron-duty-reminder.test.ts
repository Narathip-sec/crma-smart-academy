// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

import { createDutyReminderHandler } from '@/app/api/cron/duty-reminder/handler'

import type { LineMessagingClient } from '@/lib/line-messaging'

const SECRET = 'cron-secret-for-tests'

function build(auth?: string | null) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (auth !== undefined && auth !== null) headers['authorization'] = auth
  return new NextRequest(new URL('http://localhost/api/cron/duty-reminder'), {
    method: 'GET',
    headers,
  })
}

function makeMessaging(ok = true): LineMessagingClient {
  const result = ok ? { ok: true as const } : { ok: false as const, reason: 'line:500' }
  return {
    pushMessage: vi.fn().mockResolvedValue(result),
    multicast: vi.fn().mockResolvedValue(result),
    broadcast: vi.fn().mockResolvedValue(result),
  }
}

function setup(
  opts: {
    cronSecret?: string | undefined
    cadets?: ReadonlyArray<{
      cadetId: string
      lineUserId: string
      displayName: string
      shift: '00-06'
    }>
    messagingOk?: boolean
  } = {},
) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const cadets = opts.cadets ?? [
    { cadetId: 'CDT-001', lineUserId: 'U001', displayName: 'A', shift: '00-06' as const },
    { cadetId: 'CDT-002', lineUserId: 'U002', displayName: 'B', shift: '00-06' as const },
  ]
  const getDutyCadets = vi.fn().mockResolvedValue(cadets)
  const messaging = makeMessaging(opts.messagingOk ?? true)

  const handler = createDutyReminderHandler({
    audit,
    cronSecret: 'cronSecret' in opts ? opts.cronSecret : SECRET,
    getDutyCadets,
    messaging,
    now: () => new Date('2026-05-20T22:00:00Z'),
  })
  return { audit, handler, messaging, getDutyCadets }
}

describe('duty-reminder cron — env / auth gate', () => {
  test('503 + audit ERROR when CRON_SECRET is missing', async () => {
    const { audit, handler } = setup({ cronSecret: undefined })
    const res = await handler(build(`Bearer ${SECRET}`))
    expect(res.status).toBe(503)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'cron:env', result: 'ERROR' }),
    )
  })

  test('401 + audit DENY on missing authorization', async () => {
    const { audit, handler, messaging } = setup()
    const res = await handler(build())
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'cron:auth', result: 'DENY' }),
    )
    expect(messaging.multicast).not.toHaveBeenCalled()
  })

  test('401 + audit DENY on wrong bearer', async () => {
    const { audit, handler, messaging } = setup()
    const res = await handler(build('Bearer attacker'))
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'cron:auth', result: 'DENY' }),
    )
    expect(messaging.multicast).not.toHaveBeenCalled()
  })
})

describe('duty-reminder cron — happy path', () => {
  test('200 + multicast called with all lineUserIds + one audit row', async () => {
    const { audit, handler, messaging } = setup()
    const res = await handler(build(`Bearer ${SECRET}`))

    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; sent: number }
    expect(json).toEqual({ ok: true, sent: 2 })

    expect(messaging.multicast).toHaveBeenCalledTimes(1)
    const [to, messages] = (messaging.multicast as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(to).toEqual(['U001', 'U002'])
    expect((messages as { type: string; text: string }[])[0]?.type).toBe('text')

    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CRON:duty_reminder',
        resource: 'cron:date:2026-05-20',
        result: 'ALLOW',
      }),
    )
  })

  test('returns sent:0 + audit no_cadets when roster is empty', async () => {
    const { audit, handler, messaging } = setup({ cadets: [] })
    const res = await handler(build(`Bearer ${SECRET}`))

    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; sent: number }
    expect(json).toEqual({ ok: true, sent: 0 })

    expect(messaging.multicast).not.toHaveBeenCalled()
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CRON:duty_reminder',
        result: 'ALLOW',
        metadata: expect.objectContaining({ sent: 0, reason: 'no_cadets' }),
      }),
    )
  })
})
