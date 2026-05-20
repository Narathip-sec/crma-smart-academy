import { NextResponse, type NextRequest } from 'next/server'

import {
  ACCESS_COOKIE,
  buildAccessCookie,
  ENROL_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  verifyAccessToken,
  verifyEnrolToken,
  verifyRefreshToken,
  type SessionPayload,
} from '@/lib/session'

// /api/line/webhook authorises via x-line-signature HMAC; /api/cron/*
// authorises via Bearer ${CRON_SECRET}. Both gate themselves inside
// the handler, so they bypass the cookie-based middleware gate.
const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/api/line',
  '/api/cron',
  '/api/debug', // TEMP: Phase 10b env-propagation diagnostic; remove after fix
  '/login',
  '/public',
]

// Paths that accept the enrol cookie as a pass while a cadet finishes
// email + TOTP setup or proves a new device. Phase 2c covers /enrol/email,
// Phase 2d adds /enrol/totp, Phase 2e adds /reverify/totp.
// /api/auth/email/* and /api/auth/totp/* are already public under
// /api/auth and enforce the enrol-cookie inside the route handler.
const ENROL_PREFIXES = ['/enrol', '/reverify']

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function isEnrolPath(pathname: string): boolean {
  return ENROL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function attachUser(res: NextResponse, payload: SessionPayload): NextResponse {
  res.headers.set('x-user-id', payload.sub)
  res.headers.set('x-user-role', payload.role)
  res.headers.set('x-user-cadetid', payload.cadetId)
  return res
}

function unauthorized(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = `?return=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`
  return NextResponse.redirect(url)
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value
  const enrol = req.cookies.get(ENROL_COOKIE)?.value

  // Enrol pages accept a valid __Host-crma-enrol cookie. The cookie
  // itself is single-purpose (aud=crma-enrol) so it cannot leak to
  // protected /api/* paths under any other code path.
  if (isEnrolPath(pathname)) {
    if (enrol) {
      try {
        await verifyEnrolToken(enrol)
        return NextResponse.next()
      } catch {
        // Fall through — invalid enrol cookie → redirect to /login.
      }
    }
    return unauthorized(req)
  }

  // Try access token first.
  if (access) {
    try {
      const payload = await verifyAccessToken(access)
      return attachUser(NextResponse.next(), payload)
    } catch {
      // Fall through to refresh.
    }
  }

  // Try refresh token: verify, mint new access, attach.
  if (refresh) {
    try {
      const payload = await verifyRefreshToken(refresh)
      const newAccess = await signAccessToken(payload)
      const res = attachUser(NextResponse.next(), payload)
      res.headers.set('set-cookie', buildAccessCookie(newAccess))
      return res
    } catch {
      // Both tokens invalid.
    }
  }

  return unauthorized(req)
}

export const config = {
  // Run on everything; `isPublic` decides whether to skip auth checks.
  // Static asset paths are still excluded here so middleware doesn't
  // run at all on next.js internal assets (faster + cheaper).
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
