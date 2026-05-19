// App-layer envelope encryption + deterministic HMAC.
// Edge-compatible — uses Web Crypto only, no node:crypto imports.
// Phase 2c hardens User.email; Phase 2d will reuse the same primitives
// for User.totpSecret. PFTResult.* and Enrollment.grade follow in
// their owning phases.

const ENCODER = new TextEncoder()
const DECODER = new TextDecoder()

// Web Crypto types in TS 5.7+ require BufferSource to be backed by an
// ArrayBuffer, not SharedArrayBuffer. Using `new ArrayBuffer(...)` +
// Uint8Array view keeps the narrower type all the way through.
type AbView = Uint8Array<ArrayBuffer>

function base64urlDecode(input: string): AbView {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const buf = new ArrayBuffer(bin.length)
  const out = new Uint8Array(buf)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64urlEncode(input: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < input.length; i++) bin += String.fromCharCode(input[i] ?? 0)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function bytesToHex(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] ?? 0).toString(16).padStart(2, '0')
  }
  return out
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) throw new Error('ENCRYPTION_KEY env var is required')
  const bytes = base64urlDecode(raw)
  if (bytes.length !== 32) {
    throw new Error('ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256)')
  }
  return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

async function getHmacKey(): Promise<CryptoKey> {
  const raw = process.env.HMAC_KEY
  if (!raw) throw new Error('HMAC_KEY env var is required')
  const bytes = base64urlDecode(raw)
  if (bytes.length < 32) {
    throw new Error('HMAC_KEY must decode to at least 32 bytes')
  }
  return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

// HMAC is async because Web Crypto SubtleCrypto.sign is async; the Edge
// runtime has no sync alternative. All call sites already `await` since
// they're route handlers or factories.
export async function hmacEmail(emailNormalised: string): Promise<string> {
  const key = await getHmacKey()
  const sig = await crypto.subtle.sign('HMAC', key, encodePlaintext(emailNormalised))
  return bytesToHex(new Uint8Array(sig))
}

function newBytes(len: number): AbView {
  return new Uint8Array(new ArrayBuffer(len))
}

function copyBytes(src: Uint8Array, start: number, end: number): AbView {
  const buf = new ArrayBuffer(end - start)
  const view = new Uint8Array(buf)
  view.set(src.subarray(start, end))
  return view
}

function encodePlaintext(text: string): AbView {
  const encoded = ENCODER.encode(text)
  const buf = new ArrayBuffer(encoded.length)
  const view = new Uint8Array(buf)
  view.set(encoded)
  return view
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv: AbView = crypto.getRandomValues(newBytes(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodePlaintext(plaintext))
  const ctBytes = new Uint8Array(ct)
  const out = newBytes(iv.length + ctBytes.length)
  out.set(iv, 0)
  out.set(ctBytes, iv.length)
  return base64urlEncode(out)
}

export async function decrypt(envelope: string): Promise<string> {
  const key = await getEncryptionKey()
  const bytes = base64urlDecode(envelope)
  if (bytes.length < 12 + 16) {
    throw new Error('envelope too short')
  }
  const iv = copyBytes(bytes, 0, 12)
  const ct = copyBytes(bytes, 12, bytes.length)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return DECODER.decode(pt)
}
