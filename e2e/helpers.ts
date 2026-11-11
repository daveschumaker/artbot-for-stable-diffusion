import { expect, Page } from '@playwright/test'
import sharp from 'sharp'

export const MODEL = 'AlbedoBase XL (SDXL)'
const STANDARD_MODEL = 'Deliberate'
export const FALLBACK_MODEL = 'stable_diffusion'
const INPAINTING_MODEL = 'Deliberate Inpainting'
export const CAPTION = 'a small blue square'

const CORS = { 'access-control-allow-origin': '*' }

export const createTestImage = (
  format: 'png' | 'jpeg' | 'webp' = 'webp',
  width = 64,
  height = 64
) =>
  sharp({ create: { width, height, channels: 3, background: 'blue' } })
    .toFormat(format)
    .toBuffer()

const json = (body: unknown, status = 200) => ({
  status,
  headers: CORS,
  contentType: 'application/json',
  body: JSON.stringify(body)
})

const availableModel = (name: string) => ({
  name,
  count: 5,
  performance: 100000,
  queued: 0,
  eta: 5,
  type: 'image'
})

const modelDetails = (name: string, baseline: string) => ({
  name,
  baseline,
  description: 'A test model',
  inpainting: name === INPAINTING_MODEL,
  nsfw: false,
  trigger: [],
  type: 'ckpt',
  version: '1'
})

export const mockBackend = async (page: Page) => {
  const imageBytes = await createTestImage()
  const horde = {
    submissions: [] as any[],
    interrogations: [] as any[],
    urlImports: [] as any[]
  }

  // Later routes take priority. Nothing is allowed to reach a real service.
  await page.route(
    (url) =>
      ['http:', 'https:'].includes(url.protocol) &&
      url.hostname !== 'localhost',
    (route) => route.fulfill(json({}))
  )
  await page.route('**/artbot/api/**', (route) =>
    route.fulfill(json({ success: true }))
  )
  await page.route(/\/artbot\/api\/showcase/, (route) =>
    route.fulfill(json([]))
  )
  await page.route('**/artbot/api/models/available', (route) =>
    route.fulfill(
      json({
        success: true,
        models: [
          availableModel(MODEL),
          availableModel(STANDARD_MODEL),
          availableModel(FALLBACK_MODEL),
          availableModel(INPAINTING_MODEL)
        ]
      })
    )
  )
  await page.route('**/artbot/api/models/details', (route) =>
    route.fulfill(
      json({
        success: true,
        models: {
          [MODEL]: modelDetails(MODEL, 'stable_diffusion_xl'),
          [STANDARD_MODEL]: modelDetails(STANDARD_MODEL, 'stable diffusion 1'),
          [FALLBACK_MODEL]: modelDetails(FALLBACK_MODEL, 'stable diffusion 1'),
          [INPAINTING_MODEL]: modelDetails(
            INPAINTING_MODEL,
            'stable diffusion 1'
          )
        }
      })
    )
  )
  await page.route('**/artbot/api/img-from-url', (route) => {
    horde.urlImports.push(route.request().postDataJSON())
    return route.fulfill(
      json({
        success: true,
        imageType: 'image/webp',
        imgBase64String: imageBytes.toString('base64'),
        height: 64,
        width: 64
      })
    )
  })
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
  await page.route(/aihorde\.net\/api\/v2\/interrogate\/async/, (route) => {
    horde.interrogations.push(route.request().postDataJSON())
    return route.fulfill(json({ id: 'e2e-interrogation' }, 202))
  })
  await page.route(/aihorde\.net\/api\/v2\/interrogate\/status\//, (route) =>
    route.fulfill(
      json({
        state: 'done',
        forms: [
          { form: 'caption', state: 'done', result: { caption: CAPTION } }
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

export const trackPageErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

// Only for fixture setup before replacing the document. Firefox can keep the
// networkidle signal busy after Blob-backed fixtures render. Tests assert the
// actual UI and stored data after navigation instead of waiting on that signal.
export const finishFixtureSetup = async (page: Page) => {
  const browserName = page.context().browser()?.browserType().name()
  const firefox =
    browserName === 'firefox' ||
    (!browserName &&
      (await page.evaluate(() => navigator.userAgent.includes('Firefox/'))))
  if (!firefox) await page.waitForLoadState('networkidle')
}

export const expectImageToDisplay = async (page: Page, prompt: string) => {
  const image = page.getByAltText(prompt).first()
  await expect(image).toBeVisible()
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
}

export const expectNoCrash = (page: Page) =>
  expect(page.getByText('An unexpected error has occurred')).toHaveCount(0)

// The default model is SDXL, which needs 1024px images and can't use ControlNet.
export const chooseStandardModel = async (page: Page) => {
  await page
    .locator('div[class*="-control"]', { hasText: MODEL })
    .first()
    .click()
  await page
    .locator('div[class*="-option"]', { hasText: /^Deliberate \(/ })
    .first()
    .click()
}
