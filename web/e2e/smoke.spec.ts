import { expect, test } from '@playwright/test'

test('home placeholder renders under LINE webview UA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /phase 1 chassis ok/i })).toBeVisible()
})
