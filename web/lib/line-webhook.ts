// LINE webhook signature verification + event types.
// LINE signs every webhook with HMAC-SHA-256 of the raw request body
// using the channel secret. Header: `x-line-signature` is base64.
// We compare in constant time via crypto.timingSafeEqual to avoid a
// timing oracle for the channel secret.

import { createHmac, timingSafeEqual } from 'node:crypto'

export interface LineEventSource {
  type: 'user' | 'group' | 'room'
  userId?: string
  groupId?: string
  roomId?: string
}

export interface LineEvent {
  type: string // 'follow' | 'unfollow' | 'message' | ...
  timestamp: number
  source?: LineEventSource
  replyToken?: string
}

export interface LineWebhookBody {
  destination?: string
  events: ReadonlyArray<LineEvent>
}

export function verifyLineSignature(
  rawBody: string,
  signature: string | null | undefined,
  channelSecret: string,
): boolean {
  if (!signature) return false
  const hmac = createHmac('sha256', channelSecret).update(rawBody, 'utf8').digest('base64')
  // Length check first — timingSafeEqual throws on length mismatch and
  // the length itself does not leak the secret.
  if (hmac.length !== signature.length) return false
  try {
    return timingSafeEqual(Buffer.from(hmac, 'utf8'), Buffer.from(signature, 'utf8'))
  } catch {
    return false
  }
}
