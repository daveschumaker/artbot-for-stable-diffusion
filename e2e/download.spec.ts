/**
 * Downloads convert images in a real browser, which is where the canvas and
 * EXIF code runs. Jest can't cover this because jsdom has neither.
 */
import * as exifLib from '@asc0910/exif-library'
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

const generateImage = async (page: Page, prompt: string) => {
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Describe your image').fill(prompt)
  await page.getByTitle('Create new image').first().click()
  await expect
    .poll(
      () => page.evaluate(() => (window as any)._artbotDb.completed.count()),
      { timeout: 30000 }
    )
    .toBe(1)
}

const seedImage = async (page: Page, row: Record<string, unknown>) => {
  await page.goto('/artbot/images')
  await waitForDatabase(page)
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add({
      parentJobId: row.jobId,
      timestamp: 1700000000000,
      models: ['Deliberate'],
      sampler: 'k_euler',
      steps: 20,
      cfg_scale: 7,
      seed: '1',
      width: 8,
      height: 8,
      jobStatus: 'done',
      thumbnail: row.base64String,
      source_image: '',
      ...row
    })
  }, row)
}

const UNICODE_PROMPT = 'café naïve 東京'
const utf8 = (text: string) => Buffer.from(text, 'utf8')
// What a UTF-8 string becomes when its bytes are UTF-8 encoded a second time.
const doubleEncoded = (text: string) =>
  Buffer.from(utf8(text).toString('latin1'), 'utf8')

for (const { setting } of FORMATS) {
  test(`a non-ASCII prompt is written once as UTF-8 in a ${setting} download`, async ({
    page
  }) => {
    const errors = trackPageErrors(page)
    await mockBackend(page)
    await useDownloadFormat(page, setting)
    await generateImage(page, UNICODE_PROMPT)

    const file = await readDownload(
      await downloadFromDetailsPage(page, 'e2e-job', UNICODE_PROMPT)
    )

    expect(file.includes(utf8(UNICODE_PROMPT))).toBe(true)
    expect(file.includes(doubleEncoded(UNICODE_PROMPT))).toBe(false)
    expect(errors).toEqual([])
  })
}

// Earlier versions stored the prompt UTF-8 encoded twice.
test('a prompt that an earlier version encoded twice is repaired on download', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await useDownloadFormat(page, 'png')

  const jpeg = await createTestImage('jpeg', 8, 8)
  const exif = exifLib.dump({
    '0th': { 305: 'ArtBot' },
    Exif: { 37510: 'ASCII\0\0\0' + doubleEncoded('café').toString('latin1') }
  })
  const legacy = Buffer.from(
    exifLib.insert(exif, jpeg.toString('latin1')),
    'latin1'
  )
  expect(legacy.includes(doubleEncoded('café'))).toBe(true)

  await seedImage(page, {
    jobId: 'legacy',
    prompt: 'café',
    imageMimeType: 'image/jpeg',
    base64String: legacy.toString('base64')
  })

  const file = await readDownload(
    await downloadFromDetailsPage(page, 'legacy', 'café')
  )

  expect(file.includes(utf8('café'))).toBe(true)
  expect(file.includes(doubleEncoded('café'))).toBe(false)
  expect(errors).toEqual([])
})

// Only Safari takes the clipboard path that hands over a promise of the image.
for (const browser of ['Chrome', 'Safari']) {
  test(`copying an image to the clipboard copies a PNG in ${browser}`, async ({
    browser: playwright
  }) => {
    const userAgent =
      browser === 'Safari'
        ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        : undefined
    const context = await playwright.newContext({
      userAgent,
      permissions: ['clipboard-read', 'clipboard-write'],
      viewport: { width: 1280, height: 900 }
    })
    const page = await context.newPage()
    const errors = trackPageErrors(page)
    await mockBackend(page)

    const webp = await createTestImage('webp', 8, 8)
    await seedImage(page, {
      jobId: 'copy-me',
      prompt: 'copy me',
      imageMimeType: 'image/webp',
      base64String: webp.toString('base64')
    })
    await page.goto('/artbot/image/copy-me')
    await expectImageToDisplay(page, 'copy me')

    await page.locator('button:has(svg.tabler-icon-copy)').first().click()
    await page.getByText('Copy image to clipboard').click()
    await expect(
      page.getByText('Image copied to your clipboard!')
    ).toBeVisible()

    const copied = await page.evaluate(async () => {
      const [item] = await navigator.clipboard.read()
      const blob = await item.getType('image/png')
      return Array.from(new Uint8Array(await blob.arrayBuffer()).slice(0, 4))
    })
    expect(copied).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(errors).toEqual([])
    await context.close()
  })
}
