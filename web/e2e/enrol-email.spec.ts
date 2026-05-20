import { expect, test } from '@playwright/test'

test('no enrol cookie → /enrol/email redirects to /login', async ({ page }) => {
  await page.goto('/enrol/email')
  expect(page.url()).toContain('/login')
})
