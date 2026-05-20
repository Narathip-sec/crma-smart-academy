// @vitest-environment node
import { describe, expect, test } from 'vitest'

import { SECURITY_HEADERS } from '@/lib/security-headers'

function find(key: string): string | undefined {
  return SECURITY_HEADERS.find((h) => h.key === key)?.value
}

describe('SECURITY_HEADERS', () => {
  test('includes HSTS with long max-age + preload', () => {
    const hsts = find('Strict-Transport-Security')
    expect(hsts).toBeDefined()
    expect(hsts).toMatch(/max-age=\d{6,}/)
    expect(hsts).toContain('includeSubDomains')
    expect(hsts).toContain('preload')
  })

  test('clickjacking + sniff + referrer + permissions headers are present', () => {
    expect(find('X-Frame-Options')).toBe('DENY')
    expect(find('X-Content-Type-Options')).toBe('nosniff')
    expect(find('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(find('Permissions-Policy')).toMatch(/camera=\(\)/)
  })

  test('CSP locks frame-ancestors and allows LIFF SDK origin', () => {
    const csp = find('Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain('https://static.line-scdn.net')
    expect(csp).toContain('https://api.line.me')
    expect(csp).toMatch(/default-src 'self'/)
  })
})
