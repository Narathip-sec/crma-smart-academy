import { NextResponse, type NextRequest } from 'next/server'

import {
  ACCESS_COOKIE,
  buildAccessCookie,
  REFRESH_COOKIE,
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
  type SessionPayload,
} from '@/lib/session'

const PUBLIC_PREFIXES = ['/_next', '/favicon.ico', '/api/auth', '/login', '/public']

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
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
