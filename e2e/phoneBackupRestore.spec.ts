import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { expect, test as base } from '@playwright/test'
import { mockBackend, finishFixtureSetup } from './helpers'
const test = base.extend({
  context: async ({ playwright, browserName, baseURL }, runTest, info) => {
    const context = await playwright[browserName].launchPersistentContext(
      info.outputPath('private-profile'),
      { headless: true, baseURL }
    )
    try {
      await runTest(context)
    } finally {
      await context.close()
    }
  }
})
test('the verified 1721-image phone archive restores through Settings into a fresh candidate', async ({
  page
}) => {
  test.skip(
    !process.env.ARTBOT_PHONE_BACKUP,
    'Private recovered archive is never included in the repository'
  )
  test.setTimeout(600000)
  const archive = process.env.ARTBOT_PHONE_BACKUP!
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(archive)) hash.update(chunk)
  expect(hash.digest('hex')).toBe(
    '373a92c7b9c6d97f25171cf7e02deeaf93fd2ede061553c8e83b3b561f9732ea'
  )
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() => !!(window as any)._artbotDb)
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByLabel('Choose backup files', { exact: true })
    .setInputFiles(archive)
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await Promise.race([
    expect(
      page.getByText('ArtBot database imported!', { exact: false })
    ).toBeVisible({ timeout: 540000 }),
    page
      .getByText('Unable to import this database.', { exact: false })
      .waitFor({ state: 'visible', timeout: 540000 })
      .then(async () => {
        throw new Error(
          await page
            .getByText('Unable to import this database.', { exact: false })
            .innerText()
        )
      })
  ])
  const actual = await page.evaluate(async () => {
    const name = (window as any)._artbotDb.name
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const r = indexedDB.open(name)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    const count = (table: string) =>
      new Promise<number>((resolve, reject) => {
        const r = db.transaction(table).objectStore(table).count()
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      })
    const counts: Record<string, number> = {}
    for (const table of db.objectStoreNames) counts[table] = await count(table)
    let favorites = 0,
      sources = 0,
      masks = 0,
      withoutHordeID = 0
    await new Promise<void>((resolve, reject) => {
      const r = db
        .transaction('completed')
        .objectStore('completed')
        .openCursor()
      r.onerror = () => reject(r.error)
      r.onsuccess = () => {
        const c = r.result
        if (!c) {
          resolve()
          return
        }
        const row = c.value
        if (row.favorited) favorites++
        if (row.source_image) sources++
        if (row.source_mask) masks++
        if (!row.hordeImageId) withoutHordeID++
        c.continue()
      }
    })
    db.close()
    return { name, counts, favorites, sources, masks, withoutHordeID }
  })
  expect(actual.name).toMatch(/^artbot-restored-/)
  expect(actual.counts.completed).toBe(1721)
  expect(actual.counts.prompts).toBe(100)
  expect(actual.counts.settings).toBe(2)
  expect(Object.values(actual.counts).reduce((a, b) => a + b, 0)).toBe(1823)
  expect(actual).toMatchObject({
    favorites: 62,
    sources: 824,
    masks: 15,
    withoutHordeID: 753
  })
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Return to previous library' }).click()
  ])
  await page.waitForFunction(
    () => (window as any)._artbotDb?.name === 'imageHorde'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(0)
})
