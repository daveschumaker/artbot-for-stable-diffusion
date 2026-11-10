/**
 * Feeds existing images into the app through its real UI, with the AI Horde
 * mocked: file upload, URL import, mask drawing, ControlNet and interrogation.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, Page, test } from '@playwright/test'
import sharp from 'sharp'
import {
  CAPTION,
  chooseStandardModel,
  createTestImage,
  expectNoCrash,
  mockBackend,
  trackPageErrors
} from './helpers'

const library = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/library.json'), 'utf8')
)
const savedImage = library.completed.find(
  (image: any) => image.fixtureName === 'model-deliberate'
)

const decode = (base64: string) => sharp(Buffer.from(base64, 'base64'))

const upload = async (
  page: Page,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  width = 256,
  height = 256
) => {
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: `source.${format}`,
      mimeType: `image/${format}`,
      buffer: await createTestImage(format, width, height)
    })
}

const importFromUrl = async (page: Page) => {
  await page
    .locator('input[name="img-url"]')
    .fill('https://example.test/a.webp')
  await page.getByTitle('Upload image from URL').click()
}

const submit = async (page: Page) => {
  await page.getByPlaceholder('Describe your image').fill('a test prompt')
  await page.getByTitle('Create new image').first().click()
}

const expectSubmission = async (horde: { submissions: any[] }) => {
  await expect.poll(() => horde.submissions.length, { timeout: 10000 }).toBe(1)
  return horde.submissions[0]
}

const openPage = async (page: Page, url: string) => {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await chooseStandardModel(page)
}

const openImg2Img = (page: Page) =>
  openPage(page, '/artbot/create?panel=img2img')

const seedSavedImage = async (page: Page, image = savedImage) => {
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(
    (row) => (window as any)._artbotDb.completed.add(row),
    image
  )
  await page.goto(`/artbot/image/${image.jobId}`)
  await page.getByAltText(image.prompt).first().waitFor()
}

const chooseMenuItem = async (page: Page, name: string) => {
  await page.locator('.szh-menu-button').first().click()
  await page.getByRole('menuitem', { name }).click()
}

for (const format of ['png', 'jpeg', 'webp'] as const) {
  test(`img2img accepts an uploaded ${format}`, async ({ page }) => {
    const errors = trackPageErrors(page)
    const horde = await mockBackend(page)
    await openImg2Img(page)

    await upload(page, format)
    await expect(
      page.getByRole('button', { name: 'Use Inpaint' })
    ).toBeVisible()
    await submit(page)

    const request = await expectSubmission(horde)
    const metadata = await decode(request.source_image).metadata()
    expect(request.source_processing).toBe('img2img')
    expect(metadata.width).toBe(256)
    expect(metadata.height).toBe(256)
    expect(request.params).toMatchObject({ width: 256, height: 256 })
    expect(request.params.denoising_strength).toBeGreaterThan(0)
    expect(errors).toEqual([])
  })
}

test('an upload is cropped to multiples of 64', async ({ page }) => {
  const horde = await mockBackend(page)
  await openImg2Img(page)

  await upload(page, 'png', 300, 200)
  await expect(page.getByRole('button', { name: 'Use Inpaint' })).toBeVisible()
  await submit(page)

  const request = await expectSubmission(horde)
  const metadata = await decode(request.source_image).metadata()
  expect(metadata.width).toBe(256)
  expect(metadata.height).toBe(192)
  expect(request.params).toMatchObject({ width: 256, height: 192 })
})

test('img2img imports an image from a URL', async ({ page }) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await openImg2Img(page)

  await importFromUrl(page)
  await expect(page.getByRole('button', { name: 'Use Inpaint' })).toBeVisible()
  await submit(page)

  const request = await expectSubmission(horde)
  expect(horde.urlImports).toEqual([
    { imageUrl: 'https://example.test/a.webp' }
  ])
  expect(request.source_processing).toBe('img2img')
  expect((await decode(request.source_image).metadata()).width).toBe(64)
  expect(errors).toEqual([])
})

test('a mask drawn on the canvas is sent for inpainting', async ({ page }) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await openImg2Img(page)

  await upload(page)
  await page.getByRole('button', { name: 'Use Inpaint' }).click()

  const canvas = page.locator('#canvas_mask')
  await expect(canvas).toBeVisible()
  const box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + (box.width * 3) / 4, box.y + box.height / 2, {
    steps: 10
  })
  await page.mouse.up()

  await submit(page)

  const request = await expectSubmission(horde)
  expect(request.source_processing).toBe('inpainting')
  expect(request.source_image).toBeTruthy()

  const { channels } = await decode(request.source_mask).stats()
  expect(channels[0].min).toBeLessThan(50)
  expect(channels[0].max).toBeGreaterThan(200)
  expect(errors).toEqual([])
})

const savedInput = (page: Page) =>
  page.evaluate(async () => {
    const row = await (window as any)._artbotDb.settings
      .where({ name: 'promptInput' })
      .first()
    return row?.setting
  })

const drawMask = async (page: Page) => {
  const canvas = page.locator('#canvas_mask')
  await expect(canvas).toBeVisible()
  const box = (await canvas.boundingBox())!
  await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + (box.width * 3) / 4, box.y + box.height / 2, {
    steps: 10
  })
  await page.mouse.up()
}

// The create page restores saved input on every load.
const reloadCreatePage = async (page: Page) => {
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  // Saved input is written 350ms after a change.
  await page.waitForTimeout(1000)
}

test('saved img2img input is unchanged when the create page loads', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await openImg2Img(page)
  await upload(page)
  await page.getByPlaceholder('Describe your image').fill('a test prompt')
  // Reading the file and resizing it can finish after the prompt's save.
  // Wait for both parts of the input before taking the pre-reload snapshot.
  await expect
    .poll(async () => {
      const input = await savedInput(page)
      return {
        prompt: input?.prompt,
        processing: input?.source_processing,
        hasSource: Boolean(input?.source_image)
      }
    })
    .toEqual({
      prompt: 'a test prompt',
      processing: 'img2img',
      hasSource: true
    })
  const before = await savedInput(page)
  expect(before.source_processing).toBe('img2img')
  expect(before.source_image).toBeTruthy()

  await reloadCreatePage(page)

  expect(await savedInput(page)).toEqual(before)
  await page.getByTitle('Create new image').first().click()
  const request = await expectSubmission(horde)
  expect(request.source_processing).toBe('img2img')
  expect(request.source_mask).toBeUndefined()
  expect(errors).toEqual([])
})

test('a drawn inpainting mask is unchanged when the create page loads', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await openImg2Img(page)
  await upload(page)
  await page.getByRole('button', { name: 'Use Inpaint' }).click()
  await drawMask(page)
  await page.getByPlaceholder('Describe your image').fill('a test prompt')
  // A drawn mask is saved as source_mask. maskData stays empty.
  await expect
    .poll(async () => (await savedInput(page))?.source_mask)
    .toBeTruthy()
  await expect
    .poll(async () => (await savedInput(page))?.prompt)
    .toBe('a test prompt')
  const before = await savedInput(page)
  expect(before.maskData).toBe('')

  await reloadCreatePage(page)

  // The page marks input with a mask as inpainting. Nothing else changes.
  expect(await savedInput(page)).toEqual({
    ...before,
    source_processing: 'inpainting'
  })
  await page.getByTitle('Create new image').first().click()
  const request = await expectSubmission(horde)
  expect(request.source_processing).toBe('inpainting')
  const { channels } = await decode(request.source_mask).stats()
  expect(channels[0].min).toBeLessThan(50)
  expect(channels[0].max).toBeGreaterThan(200)
  expect(errors).toEqual([])
})

test('ControlNet sends an uploaded image and control type', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await openPage(page, '/artbot/controlnet')

  await upload(page)
  await expect(
    page.getByRole('button', { name: 'Remove image?' })
  ).toBeVisible()
  await submit(page)

  const request = await expectSubmission(horde)
  expect(request.params.control_type).toBe('canny')
  expect(request.params.sampler_name).toBeUndefined()
  expect((await decode(request.source_image).metadata()).width).toBe(256)
  expect(errors).toEqual([])
})

test('interrogating an upload shows its caption', async ({ page }) => {
  const errors = trackPageErrors(page)
  const horde = await mockBackend(page)
  await page.goto('/artbot/interrogate')
  await page.waitForLoadState('networkidle')

  await upload(page)

  await expect(page.getByText(CAPTION).first()).toBeVisible({ timeout: 20000 })
  expect(horde.interrogations[0].forms).toEqual([{ name: 'caption' }])
  expect(horde.interrogations[0].source_image).toBeTruthy()
  await expectNoCrash(page)
  expect(errors).toEqual([])
})

test.describe('actions on a saved image', () => {
  test('reroll requests the same image again', async ({ page }) => {
    const horde = await mockBackend(page)
    await seedSavedImage(page)

    await page.locator('.tabler-icon-refresh').first().click()

    const request = await expectSubmission(horde)
    expect(request.prompt).toContain(savedImage.prompt)
    expect(request.models).toEqual(savedImage.models)
    await expect(
      page.getByText('Re-rolling and requesting new image').first()
    ).toBeVisible()
  })

  test('reroll works on an older image', async ({ page }) => {
    const horde = await mockBackend(page)
    const [olderImage] = library.legacy
    await seedSavedImage(page, olderImage)

    await page.locator('.tabler-icon-refresh').first().click()

    const request = await expectSubmission(horde)
    expect(request.models).toEqual([olderImage.model])
  })

  test('upscale requests the upscaler', async ({ page }) => {
    const horde = await mockBackend(page)
    await seedSavedImage(page)

    await chooseMenuItem(page, 'Upscale image')

    const request = await expectSubmission(horde)
    expect(request.params.post_processing).toContain('RealESRGAN_x4plus')
    expect(request.prompt).toContain(savedImage.prompt)
  })

  test('use for img2img carries the image into a new job', async ({ page }) => {
    const horde = await mockBackend(page)
    await seedSavedImage(page)

    await chooseMenuItem(page, 'Use for img2img')
    await expect(page).toHaveURL(/panel=img2img/)
    await page.getByTitle('Create new image').first().click()

    const request = await expectSubmission(horde)
    expect(request.source_processing).toBe('img2img')
    expect(request.source_image).toBe(savedImage.base64String)
  })

  test('interrogate sends the saved image', async ({ page }) => {
    const horde = await mockBackend(page)
    await seedSavedImage(page)

    await chooseMenuItem(page, 'Interrogate (img2text)')

    await expect(page).toHaveURL(/\/interrogate/)
    await expect(page.getByText(CAPTION).first()).toBeVisible({
      timeout: 20000
    })
    expect(horde.interrogations[0].source_image).toBe(savedImage.base64String)
  })
})
