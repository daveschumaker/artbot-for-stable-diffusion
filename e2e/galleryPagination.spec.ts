import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, Page, test } from '@playwright/test'
import { createTestImage, finishFixtureSetup, mockBackend } from './helpers'

const library = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/library.json'), 'utf8')
)
const template = library.completed.find(
  (row: any) => !row.source_image && !row.upscaled && !row.control_type
)
const images = Array.from({ length: 175 }, (_, index) => ({
  ...template,
  id: index + 1,
  jobId: `pagination-${index + 1}`,
  parentJobId: `pagination-parent-${index + 1}`,
  timestamp: 1700000000000 + index,
  prompt: `pagination image ${index + 1}`,
  favorited: index % 3 === 0 || index === 1
}))
const newest = [...images].reverse()
const tiles = (page: Page) => page.locator('a[href^="/artbot/image/"]')
const jobIds = (page: Page) =>
  tiles(page).evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')?.split('/').pop())
  )
const pagination = (page: Page) =>
  page.locator('ul[class*="PaginationWrapper"]').first()
const expectRows = async (page: Page, rows: typeof images) => {
  let observed: (string | undefined)[] = []
  await expect
    // Masonry groups the DOM by column. Compare page membership independently
    // of that layout, while still rejecting duplicates or missing records.
    .poll(async () => {
      observed = (await jobIds(page)).sort()
      return observed
    })
    .toEqual(rows.map((row) => row.jobId).sort())
  // Count the observation we asserted. A route's loading render can remove
  // the tiles between this assertion and a second independent DOM read.
  return observed
}
const showPage = async (page: Page, number: number, rows: typeof images) => {
  await pagination(page).getByText(String(number), { exact: true }).click()
  return expectRows(page, rows.slice((number - 1) * 50, number * 50))
}
const filter = async (page: Page, label: string) => {
  await page.getByTitle('Filter images', { exact: true }).click()
  await page.getByText(label, { exact: true }).click()
}
const favorite = (page: Page, jobId: string) =>
  page.evaluate(async (id) => {
    const row = await (window as any)._artbotDb.completed
      .where('jobId')
      .equals(id)
      .first()
    return row.favorited
  }, jobId)

test.beforeAll(async () => {
  const image = (await createTestImage()).toString('base64')
  for (const row of images) {
    row.base64String = image
    row.thumbnail = image
    row.width = 64
    row.height = 64
  }
})

test.beforeEach(async ({ page }) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (rows) => {
    await (window as any)._artbotDb.completed.bulkAdd(rows)
  }, images)
  await finishFixtureSetup(page)
  await page.reload()
  await expectRows(page, newest.slice(0, 50))
})

test('pagination visits every image once and preserves a partial last page on reload', async ({
  page
}) => {
  const seen = await expectRows(page, newest.slice(0, 50))
  for (const number of [2, 3, 4]) {
    seen.push(...(await showPage(page, number, newest)))
  }
  expect(new Set(seen).size).toBe(175)
  await pagination(page).locator('.tabler-icon-chevron-left').click()
  await expectRows(page, newest.slice(100, 150))
  await pagination(page).locator('.tabler-icon-chevron-right').click()
  await expectRows(page, newest.slice(150))
  await page.reload()
  await expectRows(page, newest.slice(150))
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(175)
})

test('favorites persist and both filtered galleries paginate after a last-page filter change', async ({
  page
}) => {
  const favorites = newest.filter((row) => row.favorited)
  const others = newest.filter((row) => !row.favorited)
  expect(favorites).toHaveLength(60)
  expect(others).toHaveLength(115)
  await showPage(page, 4, newest)
  await filter(page, 'Show favorited')
  await expectRows(page, favorites.slice(0, 50))
  await showPage(page, 2, favorites)
  const selected = favorites[50]
  const remaining = favorites.filter((row) => row.jobId !== selected.jobId)
  await page
    .locator(`a[href="/artbot/image/${selected.jobId}"]`)
    .first()
    .click()
  const modalHeart = page.locator('#image-modal .tabler-icon-heart').first()
  await expect(modalHeart).toBeVisible()
  await modalHeart.click()
  await expect.poll(() => favorite(page, selected.jobId)).toBe(false)
  await page.reload()
  await expectRows(page, remaining.slice(50))
  expect(await favorite(page, selected.jobId)).toBe(false)
  await page.goto('/artbot/images?filter=favorited')
  await expectRows(page, remaining.slice(0, 50))
  await showPage(page, 2, remaining)
  await page.goto(`/artbot/image/${selected.jobId}`)
  await expect(page.locator('.tabler-icon-heart').first()).toBeVisible()
  await page.locator('.tabler-icon-heart').first().click()
  await expect.poll(() => favorite(page, selected.jobId)).toBe(true)
  await page.goto('/artbot/images?filter=favorited&offset=50')
  await expectRows(page, favorites.slice(50))
  await filter(page, 'Show unfavorited')
  await expectRows(page, others.slice(0, 50))
  await showPage(page, 2, others)
  await showPage(page, 3, others)
  await page.reload()
  await expectRows(page, others.slice(100))
})
