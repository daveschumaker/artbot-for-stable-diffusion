import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// Target an explicitly started, isolated production artifact. Never start a
// server here or silently attach to the developer's usual port.
const target = process.env.ARTBOT_E2E_TARGET || 'http://localhost:3298'
const runName = process.env.ARTBOT_E2E_RUN || 'all'
if (!/^[a-zA-Z0-9_-]+$/.test(runName)) throw new Error('Invalid ARTBOT_E2E_RUN')
if (!/^http:\/\/localhost:\d+$/.test(target)) {
  throw new Error('ARTBOT_E2E_TARGET must be an explicit localhost HTTP origin')
}
export default defineConfig({
  testDir: path.resolve(__dirname, '../../e2e'),
  outputDir: path.resolve(
    __dirname,
    `../../__local_db/upgrade-comparison/e2e-results/${runName}`
  ),
  fullyParallel: true,
  workers: 2,
  retries: 0,
  forbidOnly: true,
  timeout: 45000,
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: path.resolve(
          __dirname,
          `../../__local_db/upgrade-comparison/e2e-${runName}.json`
        )
      }
    ]
  ],
  use: { baseURL: target, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // These two existing tests use Chromium-specific clipboard permissions.
    // All image conversions and downloads still run in each real engine.
    {
      name: 'firefox',
      grepInvert: /copying an image to the clipboard/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      grepInvert: /copying an image to the clipboard/,
      use: { ...devices['Desktop Safari'] }
    }
  ]
})
