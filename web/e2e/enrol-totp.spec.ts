import { expect, test } from '@playwright/test'

test('no enrol cookie → /enrol/totp redirects to /login', async ({ page }) => {
  await page.goto('/enrol/totp')
  expect(page.url()).toContain('/login')
})
