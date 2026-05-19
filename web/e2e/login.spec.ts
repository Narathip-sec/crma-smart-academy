import { expect, test } from '@playwright/test'

test('login page renders Phase 2a chassis', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /sign in to crma smart academy/i })).toBeVisible()
  const button = page.getByTestId('login-line-button')
  await expect(button).toBeVisible()
  await expect(button).toBeDisabled()
  await expect(page.getByTestId('login-phase-note')).toContainText('Phase 2b')
})

test('middleware redirects unauthenticated user from /home to /login with ?return=', async ({
  page,
}) => {
  const response = await page.goto('/home')
  expect(page.url()).toContain('/login')
  expect(page.url()).toContain('return=%2Fhome')
  // 200 because we end on the login page, not 307.
  expect(response?.status()).toBe(200)
})
