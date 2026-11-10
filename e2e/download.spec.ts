/**
 * Downloads convert images in a real browser, which is where the canvas and
 * EXIF code runs. Jest can't cover this because jsdom has neither.
 */
import { expect, Page, test } from '@playwright/test'
import {
  createTestImage,
  expectImageToDisplay,
  mockBackend,
  trackPageErrors
} from './helpers'

const FORMATS = [
  { setting: 'jpg', magic: [0xff, 0xd8, 0xff] },
  { setting: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  { setting: 'webp', magic: [0x52, 0x49, 0x46, 0x46] }
] as const

const useDownloadFormat = (page: Page, format: string) =>
  page.addInitScript((format) => {
    const config = JSON.parse(localStorage.getItem('appConfig') || '{}')
    localStorage.setItem(
      'appConfig',
      // Without "v", the app treats these as old settings and replaces them.
      JSON.stringify({ v: '1', ...config, imageDownloadFormat: format })
    )
  }, format)

const waitForDatabase = (page: Page) =>
  page.waitForFunction(() => Boolean((window as any)._artbotDb?.completed))

const downloadFromDetailsPage = async (
  page: Page,
  jobId: string,
  prompt: string
) => {
  await page.goto(`/artbot/image/${jobId}`)
  await expectImageToDisplay(page, prompt)
  const download = page.waitForEvent('download', { timeout: 10000 })
  // "d" is the image page's download shortcut.
  await page.keyboard.press('d')
  return download
}

const readDownload = async (download: any) => {
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream()) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

for (const { setting, magic } of FORMATS) {
  test(`an image with no metadata downloads as ${setting}`, async ({
    page
  }) => {
    const errors = trackPageErrors(page)
    await mockBackend(page)
    await useDownloadFormat(page, setting)

    // Images saved by older versions, or imported, have no EXIF data.
    const bytes = await createTestImage('webp')
    await page.goto('/artbot/images')
    await waitForDatabase(page)
    await page.evaluate(async (base64) => {
      await (window as any)._artbotDb.completed.add({
        jobId: 'no-exif',
        parentJobId: 'no-exif',
        timestamp: 1700000000000,
        prompt: 'an image without metadata',
        models: ['Deliberate'],
        sampler: 'k_euler',
        steps: 20,
        cfg_scale: 7,
        seed: '1',
        width: 64,
        height: 64,
        jobStatus: 'done',
        imageMimeType: 'image/webp',
        base64String: base64,
        thumbnail: base64,
        source_image: ''
      })
    }, bytes.toString('base64'))

    const download = await downloadFromDetailsPage(
      page,
      'no-exif',
      'an image without metadata'
    )
    expect(download.suggestedFilename()).toBe(
      `an_image_without_metadata.${setting}`
    )
    const file = await readDownload(download)
    expect(Array.from(file.subarray(0, magic.length))).toEqual([...magic])
    expect(errors).toEqual([])
  })
}

for (const { setting, magic } of FORMATS) {
  test(`a generated image keeps its prompt when downloaded as ${setting}`, async ({
    page
  }) => {
    const errors = trackPageErrors(page)
    await mockBackend(page)
    await useDownloadFormat(page, setting)

    await page.goto('/artbot/create')
    await page.waitForLoadState('networkidle')
    await page
      .getByPlaceholder('Describe your image')
      .fill('a lighthouse at dusk')
    await page.getByTitle('Create new image').first().click()
    await expect
      .poll(
        () => page.evaluate(() => (window as any)._artbotDb.completed.count()),
        { timeout: 30000 }
      )
      .toBe(1)

    const download = await downloadFromDetailsPage(
      page,
      'e2e-job',
      'a lighthouse at dusk'
    )
    const file = await readDownload(download)
    expect(Array.from(file.subarray(0, magic.length))).toEqual([...magic])
    expect(file.includes('a lighthouse at dusk')).toBe(true)
    expect(errors).toEqual([])
  })
}

test('an image that cannot be read shows an error instead of downloading', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await useDownloadFormat(page, 'png')

  await page.goto('/artbot/images')
  await waitForDatabase(page)
  await page.evaluate(async () => {
    await (window as any)._artbotDb.completed.add({
      jobId: 'unreadable',
      parentJobId: 'unreadable',
      timestamp: 1700000000000,
      prompt: 'an unreadable image',
      models: ['Deliberate'],
      jobStatus: 'done',
      // Valid base64, but not an image.
      base64String: 'bm90IGFuIGltYWdl',
      thumbnail: 'bm90IGFuIGltYWdl',
      source_image: ''
    })
  })

  let downloaded = false
  page.on('download', () => (downloaded = true))
  await page.goto('/artbot/image/unreadable')
  await expect(page.getByText('an unreadable image').first()).toBeVisible()
  await page.keyboard.press('d')

  await expect(page.getByText('Unable to download this image.')).toBeVisible()
  expect(downloaded).toBe(false)
  expect(errors).toEqual([])
})
