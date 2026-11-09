/**
 * Browser smoke tests against a production build, with the AI Horde mocked.
 * Unlike the Jest suite these run real rendering, canvas and image handling,
 * so they are the main safety net for React and Next upgrades.
 */
import { expect, Page, test } from '@playwright/test'
import sharp from 'sharp'

const MODEL = 'AlbedoBase XL (SDXL)'
const CORS = { 'access-control-allow-origin': '*' }

let imageBytes: Buffer

test.beforeAll(async () => {
  imageBytes = await sharp({
    create: { width: 64, height: 64, channels: 3, background: 'blue' }
  })
    .webp()
    .toBuffer()
})

const json = (body: unknown, status = 200) => ({
  status,
  headers: CORS,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const mockBackend = async (page: Page) => {
  const horde = { submissions: [] as any[] }

  // Later routes take priority. Nothing is allowed to reach a real service.
  await page.route(
    (url) => url.hostname !== 'localhost',
    (route) => route.fulfill(json({}))
  )
  await page.route('**/artbot/api/**', (route) =>
    route.fulfill(json({ success: true }))
  )
  await page.route('**/artbot/api/models/available', (route) =>
    route.fulfill(
      json({
        success: true,
        models: [
          {
            name: MODEL,
            count: 5,
            performance: 100000,
            queued: 0,
            eta: 5,
            type: 'image'
          }
        ]
      })
    )
  )
  await page.route('**/artbot/api/models/details', (route) =>
    route.fulfill(
      json({
        success: true,
        models: {
          [MODEL]: {
            name: MODEL,
            baseline: 'stable_diffusion_xl',
            description: 'A test model',
            nsfw: false,
            trigger: [],
            type: 'ckpt',
            version: '1'
          }
        }
      })
    )
  )
  await page.route(/aihorde\.net\/api\/v2\/generate\/async/, (route) => {
    horde.submissions.push(route.request().postDataJSON())
    return route.fulfill(json({ id: 'e2e-job', kudos: 5 }, 202))
  })
  await page.route(/aihorde\.net\/api\/v2\/generate\/check\//, (route) =>
    route.fulfill(
      json({
        done: true,
        faulted: false,
        finished: 1,
        processing: 0,
        waiting: 0,
        wait_time: 0,
        queue_position: 0,
        is_possible: true,
        kudos: 5
      })
    )
  )
  await page.route(/aihorde\.net\/api\/v2\/generate\/status\//, (route) =>
    route.fulfill(
      json({
        done: true,
        faulted: false,
        kudos: 5,
        shared: false,
        generations: [
          {
            id: 'horde-image',
            img: 'https://r2.example.test/image.webp',
            seed: '1234',
            model: MODEL,
            censored: false,
            worker_id: 'worker',
            worker_name: 'worker'
          }
        ]
      })
    )
  )
  await page.route('https://r2.example.test/**', (route) =>
    route.fulfill({
      status: 200,
      headers: CORS,
      contentType: 'image/webp',
      body: imageBytes
    })
  )

  return horde
}

const trackPageErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const waitForDatabase = (page: Page) =>
  page.waitForFunction(() => Boolean((window as any)._artbotDb?.completed))

const seedLibrary = async (page: Page, count: number) => {
  await waitForDatabase(page)
  await page.evaluate(
    async ({ base64, count, model }) => {
      const db = (window as any)._artbotDb
      for (let i = 1; i <= count; i++) {
        await db.completed.add({
          jobId: `seed-${i}`,
          parentJobId: 'seed-parent',
          timestamp: 1700000000000 + i,
          prompt: `seeded prompt ${i}`,
          models: [model],
          sampler: 'k_euler',
          steps: 20,
          cfg_scale: 7,
          seed: String(i),
          width: 64,
          height: 64,
          jobStatus: 'done',
          base64String: base64,
          thumbnail: base64
        })
      }
    },
    { base64: imageBytes.toString('base64'), count, model: MODEL }
  )
}

test.describe('every page renders', () => {
  const routes = [
    '',
    'about',
    'changelog',
    'contact',
    'contributors',
    'controlnet',
    'create',
    'draw',
    'faq',
    'images',
    'info',
    'info/models',
    'info/models/updates',
    'info/workers',
    'interrogate',
    'live-paint',
    'pending',
    'privacy',
    'profile',
    'rate',
    'settings',
    'showcase',
    'upscale'
  ]

  for (const route of routes) {
    test(`/${route}`, async ({ page }) => {
      const errors = trackPageErrors(page)
      await mockBackend(page)

      const response = await page.goto(`/artbot/${route}`)
      await page.waitForLoadState('networkidle')

      expect(response?.status()).toBeLessThan(400)
      await expect(page.getByText('Application error')).toHaveCount(0)
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
      expect(errors).toEqual([])
    })
  }
})

test('creating an image takes it from prompt to gallery', async ({ page }) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)

  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Describe your image').fill('a cat in a hat')
  await page.getByTitle('Create new image').click()

  await page.waitForFunction(
    async () => (await (window as any)._artbotDb.completed.count()) === 1,
    undefined,
    { timeout: 30000 }
  )

  expect(horde.submissions).toHaveLength(1)
  expect(horde.submissions[0].prompt).toContain('a cat in a hat')
  expect(horde.submissions[0].models).toEqual([MODEL])

  await page.goto('/artbot/images')
  const thumbnail = page.locator('a[href="/artbot/image/e2e-job"]').first()
  await expect(thumbnail).toBeVisible()
  await thumbnail.click()

  await expect(page).toHaveURL(/\/image\/e2e-job/)
  await expect(page.getByText('a cat in a hat').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('an existing library appears in the gallery', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)

  await page.goto('/artbot/images')
  await seedLibrary(page, 3)
  await page.reload()

  for (const id of ['seed-1', 'seed-2', 'seed-3']) {
    await expect(
      page.locator(`a[href="/artbot/image/${id}"]`).first()
    ).toBeVisible()
  }

  await page.goto('/artbot/image/seed-2')
  await expect(page.getByText('seeded prompt 2').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('the drawing canvas accepts input', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)

  await page.goto('/artbot/draw')
  const canvas = page.locator('canvas').last()
  await expect(canvas).toBeVisible()

  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + 20, box!.y + 20)
  await page.mouse.down()
  await page.mouse.move(box!.x + 120, box!.y + 120, { steps: 5 })
  await page.mouse.up()

  expect(errors).toEqual([])
})
