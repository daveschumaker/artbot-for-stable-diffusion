import { expect, test } from '@playwright/test'
import { mockBackend } from './helpers'

// Manifest and launch-resource coverage. A physical installed iPhone app still
// needs the lifecycle and storage checks in docs/pwa-regression.md.
test('the Home Screen manifest and launch resources stay under the ArtBot base path', async ({
  page,
  request,
  baseURL
}) => {
  await mockBackend(page)
  await page.goto('/artbot/create')
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/artbot/manifest.json'
  )
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/artbot/appicons/square-180.png'
  )
  const response = await request.get('/artbot/manifest.json')
  expect(response.status()).toBe(200)
  const manifest = await response.json()
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('/artbot')
  expect(manifest.scope).toBe('/artbot')
  for (const resource of [
    manifest.start_url,
    '/artbot/appicons/square-180.png',
    ...manifest.icons.map((icon: any) => icon.src),
    ...manifest.shortcuts.map((shortcut: any) => shortcut.url)
  ]) {
    const url = new URL(resource, baseURL)
    expect(url.origin).toBe(new URL(baseURL!).origin)
    expect(url.pathname).toMatch(/^\/artbot(?:\/|$)/)
    expect((await request.get(url.toString())).ok()).toBe(true)
  }
})
