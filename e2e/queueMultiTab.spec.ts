import { expect, Page, test } from '@playwright/test'
import { mockBackend, MODEL } from './helpers'

test('switching tabs while jobs are queued never submits the same batch twice', async ({
  page,
  context
}) => {
  test.setTimeout(90000)
  let release = false
  const submissions: unknown[] = []
  const setup = async (tab: Page) => {
    await mockBackend(tab)
    await tab.route(/aihorde\.net\/api\/v2\/generate\/async/, (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      submissions.push(route.request().postDataJSON())
      return route.fulfill({
        status: 202,
        headers: { 'access-control-allow-origin': '*' },
        json: { id: `tab-job-${submissions.length}`, kudos: 1 }
      })
    })
    await tab.route(/aihorde\.net\/api\/v2\/generate\/check\//, (route) =>
      route.fulfill({
        headers: { 'access-control-allow-origin': '*' },
        json: {
          done: release,
          faulted: false,
          finished: release ? 1 : 0,
          processing: release ? 0 : 1,
          waiting: 0,
          wait_time: 5,
          queue_position: 0,
          is_possible: true
        }
      })
    )
    await tab.route(/aihorde\.net\/api\/v2\/generate\/status\//, (route) => {
      const id = new URL(route.request().url()).pathname.split('/').pop()
      return route.fulfill({
        headers: { 'access-control-allow-origin': '*' },
        json: {
          done: release,
          faulted: false,
          kudos: 1,
          shared: false,
          generations: release
            ? [
                {
                  id: `result-${id}`,
                  img: 'https://r2.example.test/image.webp',
                  seed: '1234',
                  model: MODEL,
                  censored: false,
                  worker_id: 'worker',
                  worker_name: 'worker'
                }
              ]
            : []
        }
      })
    })
  }
  await setup(page)
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  await page.bringToFront()
  await page
    .getByPlaceholder('Describe your image')
    .fill('a cat across two tabs')
  await page.locator('input[max="200"]:not([type="range"])').fill('10')
  await page.getByTitle('Create new image').first().click()
  await expect
    .poll(() => submissions.length, { timeout: 15000 })
    .toBeGreaterThanOrEqual(2)
  await expect
    .poll(() =>
      page.evaluate(
        async () =>
          (await (window as any)._artbotDb.pending.toArray()).filter(
            (r: any) => r.jobStatus === 'waiting'
          ).length
      )
    )
    .toBeGreaterThan(0)
  const second = await context.newPage()
  await setup(second)
  await second.goto('/artbot/pending')
  await second.bringToFront()
  await second.waitForTimeout(3500)
  await page.bringToFront()
  await page.waitForTimeout(3500)
  await second.bringToFront()
  release = true
  await expect
    .poll(
      () => second.evaluate(() => (window as any)._artbotDb.completed.count()),
      { timeout: 45000 }
    )
    .toBeGreaterThanOrEqual(10)
  await page.bringToFront()
  await page.waitForTimeout(3500)
  await second.bringToFront()
  await second.waitForTimeout(3500)
  expect(submissions).toHaveLength(10)
  expect(
    await second.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(10)
})
