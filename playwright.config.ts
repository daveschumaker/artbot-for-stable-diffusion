import { defineConfig, devices } from '@playwright/test'

const PORT = 3199
const start = `npx next start -p ${PORT}`

// E2E_SKIP_BUILD reuses an existing production build for faster local runs.
const command = process.env.E2E_SKIP_BUILD
  ? start
  : `npx next build && ${start}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 45000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command,
    url: `http://localhost:${PORT}/artbot/create`,
    reuseExistingServer: !process.env.CI,
    timeout: 300000
  }
})
