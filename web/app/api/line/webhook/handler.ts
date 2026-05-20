// LINE webhook receiver. Verifies x-line-signature HMAC-SHA-256 with
// LINE_CHANNEL_SECRET, parses the events array, and writes one
// AuditLog row per event. Returns 200 on success; LINE retries any
// non-2xx response.
//
// Factory / handler split mirrors /api/auth/line/callback so unit
// tests can inject audit + channelSecret without env var manipulation.

import { type NextRequest, NextResponse } from 'next/server'

import { audit as defaultAudit } from '@/lib/audit'
import { verifyLineSignature, type LineWebhookBody } from '@/lib/line-webhook'

export interface LineWebhookDeps {
  audit: typeof defaultAudit
  channelSecret: string | undefined
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

export function createLineWebhookHandler(deps: LineWebhookDeps) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const { ip, userAgent } = reqHeaders(req)

    if (!deps.channelSecret) {
      await deps.audit({
        userId: null,
        action: 'WEBHOOK:line_receive',
        resource: 'line:env',
        result: 'ERROR',
        ip,
        userAgent,
      })
      return jsonResponse(503, { error: 'not_configured' })
    }

    const signature = req.headers.get('x-line-signature')
    const rawBody = await req.text()

    if (!verifyLineSignature(rawBody, signature, deps.channelSecret)) {
      await deps.audit({
        userId: null,
        action: 'WEBHOOK:line_receive',
        resource: 'line:signature',
        result: 'DENY',
        ip,
        userAgent,
      })
      return jsonResponse(401, { error: 'bad_signature' })
    }

    let parsed: LineWebhookBody | null = null
    try {
      parsed = JSON.parse(rawBody) as LineWebhookBody
    } catch {
      parsed = null
    }
    if (!parsed || !Array.isArray(parsed.events)) {
      await deps.audit({
        userId: null,
        action: 'WEBHOOK:line_receive',
        resource: 'line:body',
        result: 'DENY',
        ip,
        userAgent,
      })
      return jsonResponse(400, { error: 'bad_body' })
    }

    for (const ev of parsed.events) {
      await deps.audit({
        userId: null,
        action: `WEBHOOK:line:${ev.type}`,
        resource: ev.source?.userId ? `line:${ev.source.userId}` : 'line:anon',
        result: 'ALLOW',
        ip,
        userAgent,
        metadata: { type: ev.type, timestamp: ev.timestamp },
      })
    }

    return NextResponse.json({ ok: true, received: parsed.events.length })
  }
}

export const defaultLineWebhookHandler = createLineWebhookHandler({
  audit: defaultAudit,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
})
