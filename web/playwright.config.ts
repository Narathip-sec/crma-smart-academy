import { defineConfig, devices } from '@playwright/test'

const LINE_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/13.0.0'
const LINE_ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/13.0.0'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'line-ios',
      use: { ...devices['iPhone 14'], userAgent: LINE_IOS_UA },
    },
    {
      name: 'line-android',
      use: { ...devices['Pixel 7'], userAgent: LINE_ANDROID_UA },
    },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'corepack pnpm build && corepack pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
