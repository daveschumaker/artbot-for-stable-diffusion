import { expect, test, Page } from '@playwright/test'
import { mockBackend, createTestImage, finishFixtureSetup } from './helpers'

const account = {
  username: 'settings-tester#1',
  kudos: 100,
  kudos_details: { received: 0, gifted: 0 },
  records: { request: { image: 0 }, fulfillment: { image: 0 } },
  worker_ids: [],
  sharedkey_ids: []
}
const setup = async (page: Page) => {
  await mockBackend(page)
  await page.route(/\/api\/v2\/workers$/, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'alpha', name: 'Alpha GPU', type: 'image' },
        { id: 'beta', name: 'Beta GPU', type: 'image' }
      ])
    })
  )
}
test.beforeEach(async ({ page }) => setup(page))

test('section navigation handles old links, unknown panels, mobile selection and browser history', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/artbot/settings?panel=unknown')
  await expect(
    page.getByRole('heading', { name: 'AI Horde Settings', exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('That settings section was not found.', { exact: false })
  ).toBeVisible()
  await page
    .getByLabel('Settings section', { exact: true })
    .selectOption('generation')
  await expect(page.getByLabel('Worker type', { exact: true })).toHaveValue(
    'trusted'
  )
  await page.getByLabel('Worker type', { exact: true }).selectOption('all')
  await page.reload()
  await expect(page.getByLabel('Worker type', { exact: true })).toHaveValue(
    'all'
  )
  await page
    .getByLabel('Settings section', { exact: true })
    .selectOption('prefs')
  await expect(
    page.getByRole('heading', { name: 'ArtBot Preferences', exact: true })
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel('Worker type', { exact: true })).toHaveValue(
    'all'
  )
  await page.goForward()
  await expect(page.getByLabel('ArtBot Theme', { exact: true })).toBeVisible()
  await page.goto('/artbot/settings?panel=worker')
  await expect(
    page.getByRole('heading', { name: 'Manage Workers', exact: true })
  ).toBeVisible()
  await page.goto('/artbot/settings#use-specific-workers')
  await expect(page).toHaveURL(/panel=generation#use-specific-workers/)
  await expect(
    page.getByRole('heading', {
      name: 'Use Specific Workers (0/5)',
      exact: true
    })
  ).toBeVisible()
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(
    page.getByRole('link', { name: 'Generation', exact: true })
  ).toHaveAttribute('aria-current', 'page')
})

test('settings persist, synchronize between tabs and preserve unknown stored fields', async ({
  page,
  context
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('appConfig'))
      localStorage.setItem(
        'appConfig',
        JSON.stringify({ v: '1', extraLegacy: { keep: true } })
      )
  })
  await page.goto('/artbot/settings?panel=prefs')
  const other = await context.newPage()
  await setup(other)
  await other.goto('/artbot/settings?panel=prefs')
  try {
    await page
      .getByLabel('Preferred image format', { exact: true })
      .selectOption('webp')
    await expect(
      other.getByLabel('Preferred image format', { exact: true })
    ).toHaveValue('webp')
    await other
      .getByLabel('Images per page', { exact: true })
      .selectOption('25')
    await expect(
      page.getByLabel('Images per page', { exact: true })
    ).toHaveValue('25')
    await page.reload()
    await expect(
      page.getByLabel('Images per page', { exact: true })
    ).toHaveValue('25')
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('appConfig')!).extraLegacy
      )
    ).toEqual({ keep: true })
  } finally {
    await other.close()
  }
})

test('storage failure preserves displayed preferences and keyboard toggles have accessible names', async ({
  page
}) => {
  await page.goto('/artbot/settings?panel=prefs')
  await expect(page.getByLabel('ArtBot Theme', { exact: true })).toHaveValue(
    'system'
  )
  await page.evaluate(() => {
    const set = Storage.prototype.setItem
    ;(window as any).__restoreSettingsWrites = () => {
      Storage.prototype.setItem = set
    }
    Storage.prototype.setItem = function (key, value) {
      if (key === 'appConfig')
        throw new DOMException('Synthetic storage full', 'QuotaExceededError')
      return set.call(this, key, value)
    }
  })
  await page.getByLabel('ArtBot Theme', { exact: true }).selectOption('dark')
  await expect(
    page.getByRole('alert').filter({ hasText: 'Settings were not saved' })
  ).toBeVisible()
  await expect(page.getByLabel('ArtBot Theme', { exact: true })).toHaveValue(
    'system'
  )
  await page.evaluate(() => (window as any).__restoreSettingsWrites())
  const swipe = page.getByRole('checkbox', {
    name: 'Enable page swipe on image gallery page',
    exact: true
  })
  await swipe.focus()
  await swipe.press('Space')
  await expect(swipe).not.toBeChecked()
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('appConfig')!).enableGallerySwipe
    )
  ).toBe(false)
})

test('worker restrictions save together and an empty worker list is natively disabled', async ({
  page
}) => {
  await page.goto('/artbot/settings?panel=generation')
  const blocked = page.getByRole('checkbox', {
    name: 'Enable Worker Blocklist',
    exact: true
  })
  const allowed = page.getByRole('checkbox', {
    name: 'Enable Use Specific Workers',
    exact: true
  })
  await expect(blocked).toBeDisabled()
  await expect(allowed).toBeDisabled()
  await page.locator('#blocked-worker').fill('Alpha')
  await page.getByRole('option', { name: 'Alpha GPU', exact: true }).click()
  await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  await blocked.check()
  await page.locator('#allowed-worker').fill('Beta')
  await page.getByRole('option', { name: 'Beta GPU', exact: true }).click()
  await page.getByRole('button', { name: 'Add', exact: true }).last().click()
  await allowed.check()
  await expect(blocked).not.toBeChecked()
  await expect(allowed).toBeChecked()
  expect(
    await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('appConfig')!)
      return [settings.useAllowedWorkers, settings.useBlockedWorkers]
    })
  ).toEqual([true, false])
})

test('API key validation prevents duplicate submission, preserves failed input, then saves a valid key', async ({
  page
}) => {
  let release!: () => void
  const waiting = new Promise<void>((resolve) => {
    release = resolve
  })
  let valid = false,
    calls = 0
  await page.route(/\/api\/v2\/find_user$/, async (route) => {
    calls++
    if (!valid) await waiting
    await route.fulfill({
      status: valid ? 200 : 401,
      contentType: 'application/json',
      body: JSON.stringify(valid ? account : { message: 'Invalid' })
    })
  })
  await page.goto('/artbot/settings')
  await page.getByLabel('API key', { exact: true }).fill('bad-key')
  await page.getByRole('button', { name: 'Save API key', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Checking API key…', exact: true })
  ).toBeDisabled()
  expect(calls).toBe(1)
  release()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Unable to verify API key' })
  ).toBeVisible()
  await expect(page.getByLabel('API key', { exact: true })).toHaveValue(
    'bad-key'
  )
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('appConfig')!).apiKey || ''
    )
  ).toBe('')
  valid = true
  await page.getByLabel('API key', { exact: true }).fill('valid-test-key')
  await page.getByLabel('API key', { exact: true }).press('Enter')
  await expect(
    page.getByRole('status', { name: 'API key status' })
  ).toContainText('API key saved')
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('appConfig')!).apiKey
    )
  ).toBe('valid-test-key')
})

test('thumbnail maintenance pauses without losing completed work and resumes only missing images', async ({
  page
}) => {
  test.setTimeout(120000)
  await page.goto('/artbot/images')
  await page.waitForFunction(() => (window as any)._artbotDb?.isOpen())
  const pixels = (await createTestImage('webp')).toString('base64')
  await page.evaluate(async (pixels) => {
    await (window as any)._artbotDb.completed.bulkAdd(
      Array.from({ length: 8 }, (_, index) => ({
        jobId: `thumbnail-${index}`,
        base64String: pixels,
        timestamp: Date.now() + index,
        extraLegacy: { keep: true }
      }))
    )
  }, pixels)
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=advanced')
  await expect(
    page.getByRole('heading', {
      name: 'Troubleshooting & maintenance',
      exact: true
    })
  ).toBeVisible()
  await page.evaluate(() => {
    const read = FileReader.prototype.readAsDataURL
    FileReader.prototype.readAsDataURL = function (blob) {
      setTimeout(() => read.call(this, blob), 150)
    }
  })
  await page
    .getByRole('button', { name: 'Generate thumbnails', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Generate thumbnails', exact: true })
  ).toBeDisabled()
  await expect
    .poll(() =>
      page.evaluate(
        async () =>
          (await (window as any)._artbotDb.completed.toArray()).filter(
            (row: any) => row.thumbnail
          ).length
      )
    )
    .toBeGreaterThan(0)
  await page
    .getByRole('button', { name: 'Pause maintenance', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Maintenance status' })
  ).toContainText('Paused')
  await page
    .getByRole('button', { name: 'Generate thumbnails', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Maintenance status' })
  ).toContainText('Thumbnails complete', { timeout: 60000 })
  expect(
    await page.evaluate(async () =>
      (await (window as any)._artbotDb.completed.toArray()).every(
        (row: any) => row.thumbnail && row.extraLegacy.keep
      )
    )
  ).toBe(true)
})

test('maintenance confirmations protect pending work and preference reset keeps the API key', async ({
  page
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('appConfig'))
      localStorage.setItem(
        'appConfig',
        JSON.stringify({
          v: '1',
          apiKey: 'remember-this-key',
          theme: 'dark',
          extraLegacy: 'preserve'
        })
      )
  })
  await page.goto('/artbot/images')
  await page.waitForFunction(() => (window as any)._artbotDb?.isOpen())
  await page.evaluate(async () => {
    const database = (window as any)._artbotDb
    await database.completed.add({
      jobId: 'keep-image',
      timestamp: Date.now(),
      base64String: 'preserve-image'
    })
    await database.pending.bulkAdd(
      [1, 2].map((id) => ({
        jobId: `keep-pending-${id}`,
        jobStatus: 'error',
        timestamp: Date.now()
      }))
    )
  })
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=advanced')
  await expect(
    page.getByText('2 pending items stored locally.', { exact: false })
  ).toBeVisible()
  page.once('dialog', (dialog) => dialog.dismiss())
  await page
    .getByRole('button', { name: 'Clear pending items', exact: true })
    .click()
  expect(
    await page.evaluate(() => (window as any)._artbotDb.pending.count())
  ).toBe(2)
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .getByRole('button', { name: 'Clear pending items', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Maintenance status' })
  ).toContainText('2 pending items removed')
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .getByRole('button', { name: 'Reset preferences', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Maintenance status' })
  ).toContainText('Preferences reset')
  expect(
    await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('appConfig')!)
      return {
        key: settings.apiKey,
        theme: settings.theme,
        legacy: settings.extraLegacy
      }
    })
  ).toEqual({ key: 'remember-this-key', theme: 'system', legacy: 'preserve' })
})
