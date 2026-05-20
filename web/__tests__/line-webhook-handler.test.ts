// @vitest-environment node
import { createHmac } from 'node:crypto'

import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

import { createLineWebhookHandler } from '@/app/api/line/webhook/handler'

const SECRET = 'channel-secret-for-tests'

function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64')
}

function postRaw(body: string, signature: string | null) {
  return new NextRequest(new URL('http://localhost/api/line/webhook'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(signature ? { 'x-line-signature': signature } : {}),
    },
    body,
  })
}

function setup(opts: { channelSecret?: string | undefined } = {}) {
  const audit = vi.fn().mockResolvedValue(undefined)
  const handler = createLineWebhookHandler({
    audit,
    channelSecret: 'channelSecret' in opts ? opts.channelSecret : SECRET,
  })
  return { audit, handler }
}

describe('LINE webhook — env gate', () => {
  test('503 + audit ERROR when channelSecret is missing', async () => {
    const { audit, handler } = setup({ channelSecret: undefined })
    const res = await handler(postRaw('{"events":[]}', sign('{"events":[]}')))
    expect(res.status).toBe(503)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'WEBHOOK:line_receive', result: 'ERROR' }),
    )
  })
})

describe('LINE webhook — signature gate', () => {
  test('401 + audit DENY on bad signature', async () => {
    const { audit, handler } = setup()
    const body = '{"events":[]}'
    const res = await handler(postRaw(body, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='))
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'WEBHOOK:line_receive',
        resource: 'line:signature',
        result: 'DENY',
      }),
    )
  })

  test('401 + audit DENY on missing signature header', async () => {
    const { audit, handler } = setup()
    const res = await handler(postRaw('{"events":[]}', null))
    expect(res.status).toBe(401)
    expect(audit).toHaveBeenCalledOnce()
  })
})

describe('LINE webhook — happy path', () => {
  test('200 + writes one audit row per event', async () => {
    const { audit, handler } = setup()
    const body = JSON.stringify({
      destination: 'Ubot',
      events: [
        { type: 'follow', timestamp: 1_000, source: { type: 'user', userId: 'U001' } },
        { type: 'message', timestamp: 2_000, source: { type: 'user', userId: 'U001' } },
      ],
    })
    const res = await handler(postRaw(body, sign(body)))

    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; received: number }
    expect(json).toEqual({ ok: true, received: 2 })

    // One row per event (no env / signature / body audits on the happy path).
    expect(audit).toHaveBeenCalledTimes(2)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'WEBHOOK:line:follow',
        resource: 'line:U001',
        result: 'ALLOW',
      }),
    )
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'WEBHOOK:line:message',
        resource: 'line:U001',
        result: 'ALLOW',
      }),
    )
  })

  test('400 + audit DENY when JSON body is not parseable', async () => {
    const { audit, handler } = setup()
    const body = 'not-json'
    const res = await handler(postRaw(body, sign(body)))
    expect(res.status).toBe(400)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'line:body', result: 'DENY' }),
    )
  })
})
