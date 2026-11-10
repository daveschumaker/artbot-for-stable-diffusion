/**
 * Runs the app against a library of real AI Horde images. Regenerate the
 * fixture with `npm run test:generate-library`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, Page, test } from '@playwright/test'
import {
  expectImageToDisplay,
  expectNoCrash,
  finishFixtureSetup
} from './helpers'

const library = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/library.json'), 'utf8')
)

const realImages: any[] = library.completed
const errorJob = library.pending.find(
  (job: any) => job.fixtureName === 'pending-error'
)

const blockNetwork = async (page: Page) => {
  await page.route(
    (url) =>
      ['http:', 'https:'].includes(url.protocol) &&
      url.hostname !== 'localhost',
    (route) =>
      route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        json: {}
      })
  )
  await page.route('**/artbot/api/**', (route) =>
    route.fulfill({ status: 200, json: { success: true } })
  )
}

const seed = async (
  page: Page,
  tables: { completed?: any[]; pending?: any[] }
) => {
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async ({ completed = [], pending = [] }) => {
    const db = (window as any)._artbotDb
    await db.completed.bulkAdd(completed)
    await db.pending.bulkAdd(pending)
  }, tables)
  await finishFixtureSetup(page)
}

test.beforeEach(async ({ page }) => {
  // A tall window, because gallery tiles lazy-load as they scroll into view.
  await page.setViewportSize({ width: 1280, height: 4000 })
  await blockNetwork(page)
})

test('the gallery shows every image in a real library', async ({ page }) => {
  await seed(page, { completed: realImages })
  await page.reload()

  for (const { jobId } of realImages) {
    await expect(
      page.locator(`a[href="/artbot/image/${jobId}"]`).first()
    ).toBeVisible()
  }

  await expectNoCrash(page)
})

// Every tile starts as a placeholder, and the gallery's layout puts them all in
// view at first, so in practice they all render straight away.
test('the gallery renders every tile at a normal window size', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await seed(page, { completed: realImages })
  await page.reload()

  const tiles = page.locator('a[href^="/artbot/image/"]')
  await expect(tiles).toHaveCount(realImages.length)
  await expect(page.locator('[data-lazy-placeholder]')).toHaveCount(0)

  await page.mouse.wheel(0, 4000)
  await expect(tiles.last()).toBeVisible()
  await expectNoCrash(page)
})

for (const image of realImages) {
  test(`${image.fixtureName} opens and displays`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await seed(page, { completed: [image] })

    await page.goto(`/artbot/image/${image.jobId}`)

    await expectImageToDisplay(page, image.prompt)
    await expectNoCrash(page)
    expect(errors).toEqual([])
  })
}

test('images from one batch appear as related images', async ({ page }) => {
  const batch = realImages.filter((image) =>
    image.fixtureName.startsWith('batch-')
  )
  expect(batch.length).toBeGreaterThan(1)
  await seed(page, { completed: batch })

  await page.goto(`/artbot/image/${batch[0].jobId}`)

  for (const { jobId } of batch.slice(1)) {
    await expect(
      page.locator(`a[href="/artbot/image/${jobId}"]`).first()
    ).toBeVisible()
  }
})

test('a failed job shows its error on the pending page', async ({ page }) => {
  await seed(page, { pending: [errorJob] })

  await page.goto('/artbot/pending')

  await expect(page.getByText(errorJob.errorMessage).first()).toBeVisible()
  await expectNoCrash(page)
})

for (const image of library.legacy) {
  test(`legacy image ${image.jobId} opens`, async ({ page }) => {
    await seed(page, { completed: [image] })

    await page.goto(`/artbot/image/${image.jobId}`)

    await expectImageToDisplay(page, image.prompt)
  })
}
