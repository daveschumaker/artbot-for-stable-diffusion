import { expect, test as base } from '@playwright/test'
import {
  mockBackend,
  finishFixtureSetup,
  createTestImage,
  trackPageErrors
} from './helpers'

// Exercise disk-backed Blob storage, as in an installed app. This WebKit
// revision cannot reliably store Blob files in ephemeral browser contexts.
const test = base.extend({
  context: async ({ playwright, browserName, baseURL }, runTest, info) => {
    const context = await playwright[browserName].launchPersistentContext(
      info.outputPath('profile'),
      { headless: true, baseURL }
    )
    try {
      await runTest(context)
    } finally {
      await context.close()
    }
  }
})

for (const committed of [false, true]) {
  test(`startup repairs ${committed ? 'committed' : 'uncommitted'} library preferences before rendering`, async ({
    page
  }) => {
    const errors = trackPageErrors(page)
    await mockBackend(page)
    await page.goto('/artbot/settings?panel=import-export')
    await page.waitForFunction(() => !!(window as any)._artbotDb)
    await finishFixtureSetup(page)
    // The application opens its catalog in a mounted Settings effect. Merely
    // loading the database module does not mean that upgrade has committed.
    await page
      .getByRole('button', { name: 'Prepare backup', exact: true })
      .waitFor()
    await page.waitForFunction(async () =>
      (await indexedDB.databases()).some(
        (database) =>
          database.name === 'ArtBotBackupCatalog' &&
          (database.version || 0) >= 20
      )
    )
    await page.evaluate(async (committed) => {
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        const request = indexedDB.open('ArtBotBackupCatalog')
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const after = {
        name: 'imageHorde',
        generation: 'test-recovery',
        jobsPaused: true
      }
      const values = ['before', 'after'].map((id) => ({
        id,
        value: {
          appConfig: {
            v: '1',
            theme: id === 'before' ? 'light' : 'dark',
            sentinel: id
          },
          localPreferences: {
            controlnetPageInput: `${id}-source`,
            CanvasSettings: JSON.stringify({ brushSize: 42 })
          }
        }
      }))
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('preferences', 'readwrite')
        values.forEach((value) => tx.objectStore('preferences').put(value))
        tx.oncomplete = () => resolve()
        tx.onabort = () => reject(tx.error)
      })
      db.close()
      localStorage.setItem(
        'ArtBotLibrarySelection:transition',
        JSON.stringify({
          before: null,
          after,
          catalog: 'ArtBotBackupCatalog',
          beforeSnapshot: 'before',
          afterSnapshot: 'after'
        })
      )
      if (committed)
        localStorage.setItem('ArtBotLibrarySelection', JSON.stringify(after))
      localStorage.setItem(
        'appConfig',
        JSON.stringify({ v: '1', theme: 'system', sentinel: 'partial' })
      )
      localStorage.removeItem('controlnetPageInput')
    }, committed)
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Prepare backup', exact: true })
    ).toBeVisible()
    const restored = await page.evaluate(() => ({
      config: JSON.parse(localStorage.getItem('appConfig')!),
      source: localStorage.getItem('controlnetPageInput'),
      journal: localStorage.getItem('ArtBotLibrarySelection:transition')
    }))
    expect(restored.config.sentinel).toBe(committed ? 'after' : 'before')
    expect(restored.source).toBe(`${committed ? 'after' : 'before'}-source`)
    expect(restored.journal).toBeNull()
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      committed ? 'dark' : 'light'
    )
    expect(errors).toEqual([])
  })
}

test('a saved 3 MB input restores within native localStorage quota, survives reopen, and rolls back', async ({
  page
}, info) => {
  test.setTimeout(180000)
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page.waitForFunction(() => !!(window as any)._artbotDb)
  const image = (await createTestImage()).toString('base64')
  await page.evaluate(async (base64String) => {
    await (window as any)._artbotDb.completed.add({
      jobId: 'large-pref-image',
      prompt: 'keep this image',
      base64String,
      thumbnail: base64String,
      timestamp: Date.now()
    })
    localStorage.setItem(
      'controlnetPageInput',
      JSON.stringify({ source_image: 'x'.repeat(3 * 1024 * 1024) })
    )
    localStorage.setItem('showLayout', 'grid')
  }, image)
  await finishFixtureSetup(page)
  await page.reload()
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible({ timeout: 60000 })
  const buttons = page.getByRole('button', {
    name: /^Save (manifest|part \d+)/
  })
  const paths: string[] = []
  for (let i = 0; i < (await buttons.count()); i++) {
    const downloading = page.waitForEvent('download')
    await buttons.nth(i).click()
    const download = await downloading
    const file = info.outputPath(download.suggestedFilename())
    await download.saveAs(file)
    paths.push(file)
  }
  await page.evaluate(() => localStorage.setItem('showLayout', 'layout'))
  await page
    .getByLabel('Choose backup files', { exact: true })
    .setInputFiles(paths)
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false })
  ).toBeVisible({ timeout: 60000 })
  expect(
    await page.evaluate(
      () => localStorage.getItem('ArtBotLibrarySelection')!.length
    )
  ).toBeLessThan(2000)
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('controlnetPageInput')!).source_image
          .length
    )
  ).toBe(3 * 1024 * 1024)
  expect(await page.evaluate(() => localStorage.getItem('showLayout'))).toBe(
    'grid'
  )
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Return to previous library' })
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('showLayout'))).toBe(
    'grid'
  )
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Return to previous library' }).click()
  ])
  await page.waitForFunction(
    () => (window as any)._artbotDb?.name === 'imageHorde'
  )
  expect(await page.evaluate(() => localStorage.getItem('showLayout'))).toBe(
    'layout'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
  expect(errors).toEqual([])
})
