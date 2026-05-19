import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe('LiffSignInButton', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('renders fallback when NEXT_PUBLIC_LIFF_ID is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', '')
    const { LiffSignInButton } = await import('@/components/auth/LiffSignInButton')
    render(<LiffSignInButton returnTo="/" />)
    const node = screen.getByTestId('login-line-button')
    expect(node).toBeInTheDocument()
    expect(node.tagName).not.toBe('BUTTON')
    expect(node.textContent).toMatch(/LIFF not configured/i)
    vi.unstubAllEnvs()
  })

  test('renders active button when NEXT_PUBLIC_LIFF_ID is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_LIFF_ID', '1234-abcd')
    const { LiffSignInButton } = await import('@/components/auth/LiffSignInButton')
    render(<LiffSignInButton returnTo="/" />)
    const node = screen.getByTestId('login-line-button')
    expect(node.tagName).toBe('BUTTON')
    expect(node).not.toBeDisabled()
    expect(node.textContent).toMatch(/sign in with line/i)
    vi.unstubAllEnvs()
  })
})
