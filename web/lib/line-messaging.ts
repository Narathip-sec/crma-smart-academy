// LINE Messaging API client. Phase 9 sends push / multicast / broadcast
// text messages via the channel access token.
//
// Without LINE_CHANNEL_ACCESS_TOKEN (dev / CI), every call logs to the
// console and resolves OK so test flows complete without external creds.
// Production deploys MUST set the env var. Same dev-fallback pattern
// as lib/email.ts (Brevo OTP send).
//
// Each entry takes an injected `fetcher` so route handler tests can
// assert the right URL + body without hitting the LINE API. The
// singleton bound at module load uses globalThis.fetch.

export type LineTextMessage = { type: 'text'; text: string }
export type LineMessage = LineTextMessage // extend with flex / template later

export type LineSendResult = { ok: true; reason?: string } | { ok: false; reason: string }

const PUSH_URL = 'https://api.line.me/v2/bot/message/push'
const MULTICAST_URL = 'https://api.line.me/v2/bot/message/multicast'
const BROADCAST_URL = 'https://api.line.me/v2/bot/message/broadcast'

export const LINE_MESSAGING_URLS = {
  push: PUSH_URL,
  multicast: MULTICAST_URL,
  broadcast: BROADCAST_URL,
} as const

type Fetcher = typeof fetch

export interface LineMessagingDeps {
  channelAccessToken?: string | undefined
  fetcher?: Fetcher
}

export interface LineMessagingClient {
  pushMessage: (to: string, messages: ReadonlyArray<LineMessage>) => Promise<LineSendResult>
  multicast: (
    to: ReadonlyArray<string>,
    messages: ReadonlyArray<LineMessage>,
  ) => Promise<LineSendResult>
  broadcast: (messages: ReadonlyArray<LineMessage>) => Promise<LineSendResult>
}

export function createLineMessaging(deps: LineMessagingDeps = {}): LineMessagingClient {
  const token = deps.channelAccessToken ?? process.env.LINE_CHANNEL_ACCESS_TOKEN
  const f: Fetcher = deps.fetcher ?? ((...args) => fetch(...args))

  async function post(url: string, body: object): Promise<LineSendResult> {
    if (!token) {
      console.log(`[line-messaging] noop:dev_fallback ${url}`)
      return { ok: true, reason: 'noop:dev_fallback' }
    }
    try {
      const res = await f(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) return { ok: false, reason: `line:${res.status}` }
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, reason: `line:fetch:${message}` }
    }
  }

  return {
    pushMessage: (to, messages) => post(PUSH_URL, { to, messages }),
    multicast: (to, messages) => post(MULTICAST_URL, { to, messages }),
    broadcast: (messages) => post(BROADCAST_URL, { messages }),
  }
}

export const lineMessaging: LineMessagingClient = createLineMessaging()
