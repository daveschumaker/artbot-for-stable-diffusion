import { expect, test } from '@playwright/test'
import { finishFixtureSetup, mockBackend } from './helpers'

// This drives the real app through the browser and Horde API boundary. No
// internal controller mocks: the pending records are the persistence contract.
test('ten queued images survive a reload before the first activity heartbeat', async ({
  page
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('e2eActivitySeeded')) {
      localStorage.setItem(
        'ArtBotLastActive',
        String(Math.floor(Date.now() / 1000) - 3600)
      )
      localStorage.setItem('e2eActivitySeeded', 'true')
    }
  })
  await mockBackend(page)
  let accepted = 0
  await page.route(/aihorde\.net\/api\/v2\/generate\/async/, (route) =>
    route.fulfill({
      status: 202,
      headers: { 'access-control-allow-origin': '*' },
      json: { id: `held-${++accepted}`, kudos: 1 }
    })
  )
  await page.route(/aihorde\.net\/api\/v2\/generate\/check\//, (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {
        done: false,
        faulted: false,
        finished: 0,
        processing: 0,
        waiting: 1,
        wait_time: 60,
        queue_position: 0,
        is_possible: true
      }
    })
  )
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  await page
    .getByPlaceholder('Describe your image')
    .fill('ten cats awaiting recovery')
  await page.locator('input[max="200"]:not([type="range"])').fill('10')
  await page.getByTitle('Create new image').first().click()
  await expect.poll(() => accepted).toBeGreaterThanOrEqual(3)
  const count = () =>
    page.evaluate(
      async () =>
        (await (window as any)._artbotDb.pending.toArray()).filter(
          (r: any) => r.prompt === 'ten cats awaiting recovery'
        ).length
    )
  await expect.poll(count).toBe(10)
  await page.goto('/artbot/pending')
  await page.reload()
  await page.waitForFunction(() => Boolean((window as any)._artbotDb?.pending))
  await expect.poll(count).toBe(10)
})

for (const status of [429, 503]) {
  test(`a ${status} response can recover without duplicating the image`, async ({
    page
  }) => {
    await mockBackend(page)
    let attempts = 0
    await page.route(/aihorde\.net\/api\/v2\/generate\/async/, (route) => {
      attempts++
      return route.fulfill({
        status: attempts === 1 ? status : 202,
        headers: { 'access-control-allow-origin': '*' },
        json:
          attempts === 1
            ? { message: 'Fixture service temporarily unavailable' }
            : { id: 'e2e-job', kudos: 1 }
      })
    })
    await page.goto('/artbot/create')
    await page.waitForLoadState('networkidle')
    await page
      .getByPlaceholder('Describe your image')
      .fill(`a cat after HTTP ${status}`)
    await page.getByTitle('Create new image').first().click()
    if (status === 503) {
      await expect.poll(() => attempts).toBe(1)
      await expect
        .poll(() =>
          page.evaluate(async () =>
            (await (window as any)._artbotDb.pending.toArray()).some(
              (r: any) => r.jobStatus === 'error'
            )
          )
        )
        .toBe(true)
      await page.goto('/artbot/pending')
      await page.getByRole('button', { name: 'Retry?', exact: true }).click()
    }
    await expect
      .poll(
        () => page.evaluate(() => (window as any)._artbotDb.completed.count()),
        { timeout: 30000 }
      )
      .toBe(1)
    expect(attempts).toBe(2)
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(
      await page.evaluate(() => (window as any)._artbotDb.completed.count())
    ).toBe(1)
    expect(attempts).toBe(2)
  })
}

test('canceling an acknowledged request survives a reload', async ({
  page
}) => {
  await mockBackend(page)
  let accepted = 0
  let cancellations = 0
  await page.route(/aihorde\.net\/api\/v2\/generate\/async/, (route) => {
    accepted++
    return route.fulfill({
      status: 202,
      headers: { 'access-control-allow-origin': '*' },
      json: { id: 'cancel-me', kudos: 1 }
    })
  })
  await page.route(/aihorde\.net\/api\/v2\/generate\/check\//, (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {
        done: false,
        faulted: false,
        finished: 0,
        processing: 1,
        waiting: 0,
        wait_time: 60,
        queue_position: 0,
        is_possible: true
      }
    })
  )
  await page.route(/aihorde\.net\/api\/v2\/generate\/status\//, (route) => {
    if (route.request().method() !== 'DELETE') return route.fallback()
    cancellations++
    return route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: { generations: [], kudos: 0 }
    })
  })
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Describe your image').fill('a canceled cat')
  await page.getByTitle('Create new image').first().click()
  await expect.poll(() => accepted).toBe(1)
  await page.goto('/artbot/pending')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect.poll(() => cancellations).toBe(1)
  await expect
    .poll(() => page.evaluate(() => (window as any)._artbotDb.pending.count()))
    .toBe(0)
  await page.reload()
  await finishFixtureSetup(page)
  await page.waitForFunction(() => Boolean((window as any)._artbotDb?.pending))
  expect(
    await page.evaluate(() => (window as any)._artbotDb.pending.count())
  ).toBe(0)
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(0)
  expect(accepted).toBe(1)
})

test('opening the app refreshes activity immediately, before the periodic heartbeat', async ({
  page
}) => {
  const started = Math.floor(Date.now() / 1000)
  await page.addInitScript(() => {
    localStorage.setItem(
      'ArtBotLastActive',
      String(Math.floor(Date.now() / 1000) - 3600)
    )
  })
  await mockBackend(page)
  await page.goto('/artbot/create')
  await page.waitForLoadState('networkidle')
  expect(
    await page.evaluate(() => Number(localStorage.getItem('ArtBotLastActive')))
  ).toBeGreaterThanOrEqual(started)
})

test('a request interrupted by a reload is marked failed, not left waiting', async ({
  page
}) => {
  await mockBackend(page)
  await page.goto('/artbot/pending')
  await page.waitForFunction(() => Boolean((window as any)._artbotDb?.pending))
  // A tab claimed this job, then was reloaded before the Horde answered.
  // Nothing would ever send or poll it again.
  await page.evaluate(() =>
    (window as any)._artbotDb.pending.add({
      jobId: 'interrupted-job',
      timestamp: Date.now() - 10 * 60 * 1000,
      requestedAt: Date.now() - 10 * 60 * 1000,
      jobStatus: 'requested',
      prompt: 'an interrupted request',
      models: ['Deliberate'],
      numImages: 1
    })
  )
  await finishFixtureSetup(page)

  await page.reload()

  await expect(
    page.getByText("couldn't confirm this request reached the AI Horde", {
      exact: false
    })
  ).toBeVisible()
  expect(
    await page.evaluate(
      async () =>
        (
          await (window as any)._artbotDb.pending
            .where('jobId')
            .equals('interrupted-job')
            .first()
        ).jobStatus
    )
  ).toBe('error')
})
