import { expect, test } from '@playwright/test'

test('no enrol cookie → /reverify/totp redirects to /login', async ({ page }) => {
  await page.goto('/reverify/totp')
  expect(page.url()).toContain('/login')
})
