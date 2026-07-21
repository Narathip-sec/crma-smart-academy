// POST /api/auth/line — exchange a LIFF ID token for an app session.
// Client flow: liff.init() → liff.login() if needed → liff.getIDToken() → POST here.
// Verifies the token against LINE's own verify endpoint (no local JWKS needed),
// then finds-or-creates the User + LineAccount and sets a signed session cookie.

import { prisma } from "@/lib/db";
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/session";
import type { NextRequest } from "next/server";

const CHANNEL_ID = process.env.LINE_CHANNEL_ID;

type LineVerifyResponse = {
  sub: string;
  name?: string;
  picture?: string;
  aud: string;
  exp: number;
};

export async function POST(request: NextRequest): Promise<Response> {
  if (!CHANNEL_ID) {
    return Response.json({ error: "LINE login not configured" }, { status: 503 });
  }

  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) {
    return Response.json({ error: "idToken required" }, { status: 400 });
  }

  const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: CHANNEL_ID }),
  });

  if (!verifyRes.ok) {
    return Response.json({ error: "invalid id token" }, { status: 401 });
  }

  const verified = (await verifyRes.json()) as LineVerifyResponse;

  if (verified.aud !== CHANNEL_ID || verified.exp * 1000 <= Date.now()) {
    return Response.json({ error: "invalid id token" }, { status: 401 });
  }

  const lineAccount = await prisma.lineAccount.findUnique({
    where: { lineUserId: verified.sub },
    include: { user: true },
  });

  const user = lineAccount
    ? await prisma.user.update({
        where: { id: lineAccount.userId },
        data: {
          displayName: verified.name ?? lineAccount.user.displayName,
          avatarUrl: verified.picture ?? lineAccount.user.avatarUrl,
        },
      })
    : await prisma.user.create({
        data: {
          displayName: verified.name ?? "Cadet",
          avatarUrl: verified.picture,
          lineAccount: { create: { lineUserId: verified.sub } },
        },
      });

  const cookie = createSessionCookie(user.id);
  const secureAttr = process.env.NODE_ENV === "production" ? "; Secure" : "";

  const response = Response.json({ ok: true, userId: user.id });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secureAttr}`
  );
  return response;
}
