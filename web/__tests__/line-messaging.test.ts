// @vitest-environment node
import { describe, expect, test, vi } from 'vitest'

import { createLineMessaging, LINE_MESSAGING_URLS } from '@/lib/line-messaging'

function mockFetch(status = 200, body: unknown = { ok: true }) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )
}

describe('createLineMessaging — dev fallback', () => {
  test('no token → resolves OK with dev_fallback reason; never calls fetcher', async () => {
    const fetcher = vi.fn()
    const client = createLineMessaging({ channelAccessToken: undefined, fetcher })
    const r = await client.pushMessage('Uabc', [{ type: 'text', text: 'hi' }])
    expect(r).toEqual({ ok: true, reason: 'noop:dev_fallback' })
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('createLineMessaging — push / multicast / broadcast', () => {
  test('pushMessage POSTs to push URL with Bearer + body', async () => {
    const fetcher = mockFetch()
    const client = createLineMessaging({ channelAccessToken: 'tok', fetcher })
    const r = await client.pushMessage('Uabc', [{ type: 'text', text: 'hi' }])

    expect(r).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe(LINE_MESSAGING_URLS.push)
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer tok')
    expect(JSON.parse(init?.body as string)).toEqual({
      to: 'Uabc',
      messages: [{ type: 'text', text: 'hi' }],
    })
  })

  test('multicast POSTs to multicast URL with array recipients', async () => {
    const fetcher = mockFetch()
    const client = createLineMessaging({ channelAccessToken: 'tok', fetcher })
    await client.multicast(['U1', 'U2'], [{ type: 'text', text: 'go' }])

    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe(LINE_MESSAGING_URLS.multicast)
    expect(JSON.parse(init?.body as string)).toEqual({
      to: ['U1', 'U2'],
      messages: [{ type: 'text', text: 'go' }],
    })
  })

  test('broadcast POSTs to broadcast URL with messages only', async () => {
    const fetcher = mockFetch()
    const client = createLineMessaging({ channelAccessToken: 'tok', fetcher })
    await client.broadcast([{ type: 'text', text: 'all' }])

    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe(LINE_MESSAGING_URLS.broadcast)
    expect(JSON.parse(init?.body as string)).toEqual({
      messages: [{ type: 'text', text: 'all' }],
    })
  })

  test('non-2xx response → ok:false with line:<status>', async () => {
    const fetcher = mockFetch(429)
    const client = createLineMessaging({ channelAccessToken: 'tok', fetcher })
    const r = await client.pushMessage('U1', [{ type: 'text', text: 'x' }])
    expect(r).toEqual({ ok: false, reason: 'line:429' })
  })

  test('fetcher throws → ok:false with line:fetch:<msg>', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('econnreset'))
    const client = createLineMessaging({ channelAccessToken: 'tok', fetcher })
    const r = await client.pushMessage('U1', [{ type: 'text', text: 'x' }])
    expect(r).toEqual({ ok: false, reason: 'line:fetch:econnreset' })
  })
})
