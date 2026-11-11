import { expect, test } from '@playwright/test'
import { mockBackend } from './helpers'

const IMAGE_ENDPOINT = '/artbot/_next/image'

test('unit test files are not published as API routes', async ({ request }) => {
  const response = await request.get('/artbot/api/telemetry.test')

  expect(response.status()).toBe(404)
})

test.describe('the image optimization endpoint is disabled', () => {
  for (const url of [
    '/artbot/favicon.ico',
    'https://raw.githubusercontent.com/a/b/c.svg',
    'https://huggingface.co/a.avif'
  ]) {
    test(`for ${url}`, async ({ request }) => {
      const response = await request.get(IMAGE_ENDPOINT, {
        params: { url, w: 64, q: 75 }
      })

      expect(response.status()).toBe(404)
    })
  }

  test('even with the middleware bypass header', async ({ request }) => {
    const response = await request.get(IMAGE_ENDPOINT, {
      params: { url: '/artbot/favicon.ico', w: 64, q: 75 },
      headers: {
        'x-middleware-subrequest':
          'middleware:middleware:middleware:middleware:middleware'
      }
    })

    expect(response.status()).toBe(404)
  })
})

test('image import refuses internal addresses', async ({ request }) => {
  for (const imageUrl of [
    'http://localhost:3199/artbot/create',
    'http://127.0.0.1:3199/artbot/create',
    'http://169.254.169.254/latest/meta-data/',
    'file:///etc/passwd'
  ]) {
    const response = await request.post('/artbot/api/img-from-url', {
      data: { imageUrl }
    })

    expect(await response.json()).toEqual({
      success: false,
      status: 'INVALID_IMAGE_URL'
    })
  }
})

test('server messages cannot run scripts', async ({ page }) => {
  await mockBackend(page)
  await page.route('**/artbot/api/server-info', (route) =>
    route.fulfill({
      json: {
        success: true,
        build: 'e2e',
        serverMessage: {
          title: 'Maintenance notice',
          content:
            'Read <a href="https://example.test/news">the news</a>' +
            '<img src="x" onerror="window.__xss = true">' +
            '<script>window.__xss = true</script>'
        }
      }
    })
  )

  await page.goto('/artbot/about')

  await expect(page.getByRole('link', { name: 'the news' })).toBeVisible({
    timeout: 20000
  })
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined()
})
