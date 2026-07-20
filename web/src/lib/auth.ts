// Current-user resolution for API routes and server components.
// Real path: signed session cookie (set by POST /api/auth/line after LIFF login).
// Dev fallback: DEV_USER_EMAIL lookup, only in non-production builds with
// NEXT_PUBLIC_LIFF_ID unset — gated on NODE_ENV too so a production deploy
// that forgets to set NEXT_PUBLIC_LIFF_ID fails closed (401) instead of
// silently authenticating every request as the seeded dev user.

import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/session";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";
const LIFF_CONFIGURED = !!process.env.NEXT_PUBLIC_LIFF_ID;
const DEV_FALLBACK_ALLOWED = process.env.NODE_ENV !== "production";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = verifySessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  if (!LIFF_CONFIGURED && DEV_FALLBACK_ALLOWED) {
    return prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  }

  return null;
}
