import { expect, test } from '@playwright/test'

test('login page renders LIFF chassis (NEXT_PUBLIC_LIFF_ID unset)', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /sign in to crma smart academy/i })).toBeVisible()
  // With no NEXT_PUBLIC_LIFF_ID configured, LiffSignInButton renders a
  // role="status" fallback instead of an active <button>.
  const node = page.getByTestId('login-line-button')
  await expect(node).toBeVisible()
  await expect(node).toHaveText(/LIFF not configured/i)
  await expect(page.getByTestId('login-phase-note')).toContainText('Phase 2')
})

test('middleware redirects unauthenticated user from /home to /login with ?return=', async ({
  page,
}) => {
  const response = await page.goto('/home')
  expect(page.url()).toContain('/login')
  expect(page.url()).toContain('return=%2Fhome')
  expect(response?.status()).toBe(200)
})
