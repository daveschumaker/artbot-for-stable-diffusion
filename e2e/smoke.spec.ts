/**
 * Browser smoke tests against a production build, with the AI Horde mocked.
 * Unlike the Jest suite these run real rendering, canvas and image handling,
 * so they are the main safety net for React and Next upgrades.
 */
import { expect, Page, test } from '@playwright/test'
import sharp from 'sharp'
import {
  expectImageToDisplay,
  MODEL,
  mockBackend,
  trackPageErrors
} from './helpers'

let imageBytes: Buffer

test.beforeAll(async () => {
  imageBytes = await sharp({
    create: { width: 64, height: 64, channels: 3, background: 'blue' }
  })
    .webp()
    .toBuffer()
})

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
          thumbnail: base64,
          source_image: ''
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
      await expect(
        page.getByText('An unexpected error has occurred')
      ).toHaveCount(0)
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
  // The form has an action panel above and below it.
  await page.getByTitle('Create new image').first().click()

  await expect
    .poll(
      () => page.evaluate(() => (window as any)._artbotDb.completed.count()),
      { timeout: 30000 }
    )
    .toBe(1)

  expect(horde.submissions).toHaveLength(1)
  expect(horde.submissions[0].prompt).toContain('a cat in a hat')
  expect(horde.submissions[0].models).toEqual([MODEL])

  await page.goto('/artbot/images')
  const thumbnail = page.locator('a[href="/artbot/image/e2e-job"]').first()
  await expect(thumbnail).toBeVisible()
  await thumbnail.click()

  // On desktop, a thumbnail opens the image in a modal.
  await expectImageToDisplay(page, 'a cat in a hat')

  await page.goto('/artbot/image/e2e-job')
  await expectImageToDisplay(page, 'a cat in a hat')
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
  await expectImageToDisplay(page, 'seeded prompt 2')
  expect(errors).toEqual([])
})

test('an older image with a single model field opens', async ({ page }) => {
  await mockBackend(page)

  await page.goto('/artbot/images')
  await seedLibrary(page, 1)
  await page.evaluate(() =>
    (window as any)._artbotDb.completed
      .where('jobId')
      .equals('seed-1')
      .modify((row: any) => {
        delete row.models
        row.model = 'stable_diffusion'
      })
  )

  await page.goto('/artbot/image/seed-1')

  await expectImageToDisplay(page, 'seeded prompt 1')
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
