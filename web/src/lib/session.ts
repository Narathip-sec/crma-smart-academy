// Signed session cookie — HMAC-SHA256, no external deps.
// Format: base64url(payload).base64url(signature)

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "crma_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

type SessionPayload = { userId: string; iat: number };

// Resolved lazily (not at module load) so build-time route-metadata
// collection — which imports this module without ever signing a cookie —
// doesn't trip the production guard.
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set in production");
    }
    return "dev-insecure-secret-do-not-use-in-prod";
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionCookie(userId: string): string {
  const payload: SessionPayload = { userId, iat: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifySessionCookie(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const [data, sig] = cookie.split(".");
  if (!data || !sig) return null;

  const expected = sign(data);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (Date.now() - payload.iat > SESSION_MAX_AGE * 1000) return null;
    return payload.userId;
  } catch {
    return null;
  }
}
