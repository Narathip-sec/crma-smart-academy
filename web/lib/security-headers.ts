// Phase 10 hardening — security headers applied to every response via
// next.config.ts headers().
//
// CSP rationale:
//   - default-src 'self' is the deny-by-default base.
//   - script-src adds the LINE CDN (LIFF SDK loads from static.line-scdn.net)
//     plus 'unsafe-inline' + 'unsafe-eval'. Next.js hydration ships inline
//     bootstrap scripts; switching to nonces is a follow-up. 'unsafe-eval'
//     is needed by the LIFF SDK on iOS in-app webview.
//   - style-src 'unsafe-inline' covers Tailwind v4's runtime style block.
//   - img-src allows data: URLs (QR code PNGs from the TOTP enrol flow)
//     plus any https origin (LINE avatar URLs).
//   - connect-src locks XHR/fetch to same-origin + the LINE Messaging API.
//   - frame-ancestors 'none' blocks clickjacking even where the legacy
//     X-Frame-Options header is ignored.
//
// HSTS preload list submission is the operator's responsibility once the
// custom apex domain lands (see CLAUDE.md Phase 10 progress row).

export interface AppHeader {
  key: string
  value: string
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.line-scdn.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.line.me https://access.line.me",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

export const SECURITY_HEADERS: ReadonlyArray<AppHeader> = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Content-Security-Policy', value: CSP },
]
