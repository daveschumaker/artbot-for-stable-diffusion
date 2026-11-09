import { expect, test } from '@playwright/test'

const IMAGE_ENDPOINT = '/artbot/_next/image'

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
