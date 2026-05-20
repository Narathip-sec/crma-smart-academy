import { SECURITY_HEADERS } from './lib/security-headers'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Phase 10 — apply hardened security headers (CSP/HSTS/XFO/etc.) to
  // every response. The list lives in lib/security-headers.ts so unit
  // tests can assert each entry without importing the full Next config.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS.map(({ key, value }) => ({ key, value })),
      },
    ]
  },
}

export default nextConfig
