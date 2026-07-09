// Current-user resolution for API routes and server components.
// Real path: signed session cookie (set by POST /api/auth/line after LIFF login).
// Dev fallback: DEV_USER_EMAIL lookup, only when NEXT_PUBLIC_LIFF_ID is unset —
// once LIFF is configured, an invalid/missing session means unauthenticated.

import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/session";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";
const LIFF_CONFIGURED = !!process.env.NEXT_PUBLIC_LIFF_ID;

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = verifySessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  if (!LIFF_CONFIGURED) {
    return prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  }

  return null;
}
