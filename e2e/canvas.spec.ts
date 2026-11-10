/**
 * Drives the drawing editor and checks real pixels at exact coordinates, so a
 * stroke that lands in the wrong place or fails to render is caught.
 */
import { expect, Page, test } from '@playwright/test'
import sharp from 'sharp'
import {
  chooseStandardModel,
  createTestImage,
  FALLBACK_MODEL,
  mockBackend,
  trackPageErrors
} from './helpers'

const LOWER_CANVAS = 'canvas.lower-canvas'
const UPPER_CANVAS = 'canvas.upper-canvas'

const icon = (page: Page, name: string) =>
  page.locator(`.tabler-icon-${name}`).first()

const pixelAt = (page: Page, x: number, y: number) =>
  page.evaluate(
    ({ selector, x, y }) => {
      const canvas = document.querySelector(selector) as HTMLCanvasElement
      return Array.from(
        canvas.getContext('2d')!.getImageData(x, y, 1, 1).data
      ) as number[]
    },
    { selector: LOWER_CANVAS, x, y }
  )

const isDark = ([r, g, b, a]: number[]) => a > 200 && r + g + b < 60
const isWhite = ([r, g, b, a]: number[]) => a > 200 && r + g + b > 720
const isRed = ([r, g, b, a]: number[]) => a > 200 && r > 200 && g < 40 && b < 40

const expectPixel = (
  page: Page,
  x: number,
  y: number,
  matcher: (pixel: number[]) => boolean
) => expect.poll(async () => matcher(await pixelAt(page, x, y))).toBe(true)

// The page can still be moving after a menu closes, which would make a stroke
// land somewhere other than where it was measured.
const settledCanvasBox = async (page: Page) => {
  const canvas = page.locator(UPPER_CANVAS)
  await expect
    .poll(async () => {
      // Repeated because the page can scroll again while a menu closes.
      await canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      const first = await canvas.boundingBox()
      await page.waitForTimeout(100)
      const second = await canvas.boundingBox()

      if (!first || first.x !== second?.x || first.y !== second?.y) {
        return false
      }

      // A closing menu can still be covering the canvas.
      return page.evaluate(
        ([x, y]) =>
          document.elementFromPoint(x, y)?.classList.contains('upper-canvas'),
        [first.x + 100, first.y + 100]
      )
    })
    .toBe(true)

  return (await canvas.boundingBox())!
}

const drawLine = async (
  page: Page,
  [fromX, fromY]: number[],
  [toX, toY]: number[]
) => {
  const box = await settledCanvasBox(page)
  await page.mouse.move(box.x + fromX, box.y + fromY)
  await page.mouse.down()
  await page.mouse.move(box.x + toX, box.y + toY, { steps: 12 })
  await page.mouse.up()
}

const drawStandardLine = (page: Page) => drawLine(page, [60, 100], [340, 100])

const openDrawPage = async (page: Page) => {
  await page.goto('/artbot/draw')
  await expect(page.locator(UPPER_CANVAS)).toBeVisible()
  await expectPixel(page, 200, 100, isWhite)
}

const chooseMenuItem = async (page: Page, name: string) => {
  await icon(page, 'menu').click()
  await page.getByText(name, { exact: true }).click()
}

const decode = (base64: string) => sharp(Buffer.from(base64, 'base64'))

const uploadedPixel = async (base64: string, x: number, y: number) => {
  const { data, info } = await decode(base64)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const offset = (y * info.width + x) * info.channels

  return [...data.subarray(offset, offset + 3), 255] as number[]
}

let errors: string[]

test.beforeEach(async ({ page }) => {
  errors = trackPageErrors(page)
})

test.afterEach(() => {
  expect(errors).toEqual([])
})

test.describe('the draw page', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page)
    await openDrawPage(page)
  })

  test('draws a stroke exactly where the pointer moved', async ({ page }) => {
    await drawStandardLine(page)

    await expectPixel(page, 200, 100, isDark)
    await expectPixel(page, 70, 100, isDark)
    await expectPixel(page, 330, 100, isDark)
    await expectPixel(page, 200, 60, isWhite)
    await expectPixel(page, 200, 140, isWhite)
  })

  test('keeps earlier strokes when another is drawn', async ({ page }) => {
    await drawStandardLine(page)
    await drawLine(page, [60, 200], [340, 200])

    await expectPixel(page, 200, 100, isDark)
    await expectPixel(page, 200, 200, isDark)
    await expectPixel(page, 200, 150, isWhite)
  })

  test('undoes and redoes a stroke', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await icon(page, 'arrow-back-up').click()
    await expectPixel(page, 200, 100, isWhite)

    await icon(page, 'arrow-forward-up').click()
    await expectPixel(page, 200, 100, isDark)
  })

  test('undoes with the keyboard', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await page.keyboard.press('Control+z')

    await expectPixel(page, 200, 100, isWhite)
  })

  test('undoes only the most recent stroke', async ({ page }) => {
    await drawStandardLine(page)
    await drawLine(page, [60, 200], [340, 200])
    await expectPixel(page, 200, 200, isDark)

    await icon(page, 'arrow-back-up').click()

    await expectPixel(page, 200, 200, isWhite)
    await expectPixel(page, 200, 100, isDark)
  })

  test('erases part of a stroke', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await icon(page, 'eraser').click()
    await drawLine(page, [200, 60], [200, 140])

    await expectPixel(page, 200, 100, isWhite)
    await expectPixel(page, 100, 100, isDark)
  })

  test('uses the chosen brush size', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)
    expect(isWhite(await pixelAt(page, 200, 122))).toBe(true)

    await icon(page, 'adjustments').click()
    await page.locator('input[type="range"]').first().fill('60')
    await page.mouse.click(4, 4)
    await drawLine(page, [60, 250], [340, 250])

    await expectPixel(page, 200, 272, isDark)
  })

  test('picks a colour from the canvas', async ({ page }) => {
    await chooseMenuItem(page, 'Upload image')
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: 'red.png',
        mimeType: 'image/png',
        buffer: await sharp({
          create: { width: 256, height: 256, channels: 3, background: 'red' }
        })
          .png()
          .toBuffer()
      })
    await expectPixel(page, 128, 128, isRed)

    await icon(page, 'color-picker').click()
    const box = (await page.locator(UPPER_CANVAS).boundingBox())!
    await page.mouse.move(box.x + 100, box.y + 100)
    await page.mouse.move(box.x + 128, box.y + 128, { steps: 3 })
    await page.mouse.down()
    await page.mouse.up()

    await expect
      .poll(() =>
        page
          .locator('div.w-6.h-6')
          .first()
          .evaluate((el) => (el as HTMLElement).style.backgroundColor)
      )
      .toMatch(/rgba?\(25[0-5], 0, 0/)
  })

  test('imports an image and draws over it', async ({ page }) => {
    await chooseMenuItem(page, 'Upload image')
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: 'blue.png',
        mimeType: 'image/png',
        buffer: await createTestImage('png', 320, 256)
      })

    const isBlue = ([r, g, b, a]: number[]) =>
      a > 200 && b > 200 && r < 40 && g < 40

    await expectPixel(page, 160, 128, isBlue)
    await expectPixel(page, 310, 250, isBlue)

    await drawLine(page, [40, 100], [280, 100])

    await expectPixel(page, 160, 100, isDark)
    await expectPixel(page, 160, 200, isBlue)
  })

  test('restores a drawing after navigating away', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await page.locator('a[href="/artbot/pending"]').first().click()
    await expect(page).toHaveURL(/\/pending/)
    await page.goBack()
    await expect(page.locator(UPPER_CANVAS)).toBeVisible()

    await expectPixel(page, 200, 100, isDark)
    await expectPixel(page, 200, 180, isWhite)

    await drawLine(page, [60, 200], [340, 200])
    await expectPixel(page, 200, 200, isDark)
    await expectPixel(page, 200, 100, isDark)
  })

  test('clears the canvas and keeps drawing', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await icon(page, 'trash').click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await expectPixel(page, 200, 100, isWhite)

    await drawLine(page, [60, 200], [340, 200])
    await expectPixel(page, 200, 200, isDark)
  })

  test('starts a new canvas and keeps drawing', async ({ page }) => {
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await chooseMenuItem(page, 'New canvas...')
    await page
      .getByRole('button', { name: 'Create', exact: true })
      .last()
      .click()

    await expect(page.locator(UPPER_CANVAS)).toBeVisible()
    await expectPixel(page, 200, 100, isWhite)

    await drawLine(page, [60, 200], [340, 200])
    await expectPixel(page, 200, 200, isDark)
  })

  test('sends the drawing to ControlNet', async ({ page }) => {
    const horde = await mockBackend(page)
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await chooseMenuItem(page, 'Use for ControlNet')
    await expect(page).toHaveURL(/controlnet\?drawing=true/)
    await page.waitForLoadState('networkidle')
    await chooseStandardModel(page)
    await page.getByPlaceholder('Describe your image').fill('a drawing')
    await page.getByTitle('Create new image').first().click()

    await expect
      .poll(() => horde.submissions.length, { timeout: 10000 })
      .toBe(1)
    const [request] = horde.submissions

    expect(isDark(await uploadedPixel(request.source_image, 200, 100))).toBe(
      true
    )
    expect(isWhite(await uploadedPixel(request.source_image, 200, 160))).toBe(
      true
    )
  })

  test('sends the drawing to img2img', async ({ page }) => {
    const horde = await mockBackend(page)
    await drawStandardLine(page)
    await expectPixel(page, 200, 100, isDark)

    await chooseMenuItem(page, 'Use for img2img')
    await expect(page).toHaveURL(/\/create\?drawing=true/)
    // A drawing loads with the fallback model, which works for img2img.
    await expect(
      page.locator('div[class*="-control"]', { hasText: FALLBACK_MODEL })
    ).toBeVisible()
    await page.getByPlaceholder('Describe your image').fill('a drawing')
    await page.getByTitle('Create new image').first().click()

    await expect
      .poll(() => horde.submissions.length, { timeout: 10000 })
      .toBe(1)
    const [request] = horde.submissions

    expect(request.source_processing).toBe('img2img')
    expect(request.models).toEqual([FALLBACK_MODEL])
    expect(isDark(await uploadedPixel(request.source_image, 200, 100))).toBe(
      true
    )
    expect(isWhite(await uploadedPixel(request.source_image, 200, 160))).toBe(
      true
    )
  })
})

test('live paint sends the drawing as it changes', async ({ page }) => {
  const horde = await mockBackend(page)
  await page.goto('/artbot/live-paint')
  await expect(page.locator(UPPER_CANVAS)).toBeVisible()

  await page.getByPlaceholder('Describe your image').first().fill('a sketch')
  await chooseStandardModel(page)
  await drawLine(page, [40, 100], [240, 100])

  await expectPixel(page, 140, 100, isDark)
  await expect
    .poll(() => horde.submissions.length, { timeout: 20000 })
    .toBeGreaterThan(0)

  const request = horde.submissions[horde.submissions.length - 1]
  expect(isDark(await uploadedPixel(request.source_image, 140, 100))).toBe(true)
})
