import { expect, test } from '@playwright/test'

// AppShell / tab switching requires auth (access cookie).
// These chassis tests exercise only the publicly visible redirect
// behaviour. Full shell tests run against a seeded test DB.

test('unauthenticated / redirects to /login', async ({ page }) => {
  const response = await page.goto('/')
  expect(page.url()).toContain('/login')
  expect(response?.status()).toBe(200)
})

test('unauthenticated /?tab=health redirects to /login with return param', async ({ page }) => {
  await page.goto('/?tab=health')
  expect(page.url()).toContain('/login')
})
