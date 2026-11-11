import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test as base } from '@playwright/test'
import { mockBackend, finishFixtureSetup, createTestImage } from './helpers'

// Native Blob storage failed in this WebKit revision's ephemeral contexts.
// Exercise on-disk storage, as used by normal browser profiles.
const test = base.extend({
  context: async ({ playwright, browserName, baseURL }, runTest, testInfo) => {
    const context = await playwright[browserName].launchPersistentContext(
      testInfo.outputPath('profile'),
      { headless: true, baseURL, viewport: { width: 1280, height: 900 } }
    )
    try {
      await runTest(context)
    } finally {
      await context.close()
    }
  }
})

test.setTimeout(180000)

const library = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/library.json'), 'utf8')
)
const fixtures = ['img2img', 'inpainting', 'tiling'].map((name) => {
  const row = { ...library.completed.find((r: any) => r.fixtureName === name) }
  delete row.id
  delete row.fixtureName
  return row
})
const sha = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex')

test('a 1700-image backup reads one image at a time and restores every row and Blob', async ({
  page
}) => {
  test.setTimeout(120000)
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  const image = (await createTestImage()).toString('base64')
  await page.evaluate(async (base64) => {
    const rows = Array.from({ length: 1700 }, (_, index) => ({
      jobId: `large-backup-${index}`,
      timestamp: 1700000000000 + index,
      prompt: `backup image ${index}`,
      base64String: base64,
      thumbnail: base64,
      width: 64,
      height: 64,
      favorited: index % 2 === 0,
      ...(index === 0
        ? {
            payload: new Blob([new Uint8Array(1024 * 1024).fill(137)], {
              type: 'application/octet-stream'
            })
          }
        : {})
    }))
    await (window as any)._artbotDb.completed.bulkAdd(rows)
  }, image)
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Download database', exact: true })
  ).toBeVisible()
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.getAll
    ;(window as any).restoreExportReads = () => {
      IDBObjectStore.prototype.getAll = original
    }
    ;(window as any).exportReadSizes = []
    IDBObjectStore.prototype.getAll = function (
      this: IDBObjectStore,
      ...args: any[]
    ) {
      if (this.name === 'completed') {
        // Dexie 4 passes one options object, getAll({ query, count }), where
        // the browser supports it, and getAll(query, count) otherwise.
        const [first, second] = args
        const usesOptions =
          first !== null &&
          typeof first === 'object' &&
          !(first instanceof IDBKeyRange)
        const count = usesOptions ? first.count : second
        ;(window as any).exportReadSizes.push(count)
        if (count !== 1)
          throw new Error('Export attempted to read a whole image batch')
      }
      return (original as any).apply(this, args)
    } as any
  })
  const downloadEvent = page.waitForEvent('download', { timeout: 30000 })
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloadEvent
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const backup = Buffer.concat(chunks)
  const exported = JSON.parse(backup.toString())
  expect(
    exported.data.data.find((table: any) => table.tableName === 'completed')
      .rows
  ).toHaveLength(1700)
  const reads = await page.evaluate(() => {
    ;(window as any).restoreExportReads()
    return (window as any).exportReadSizes
  })
  expect(reads.length).toBeGreaterThanOrEqual(1700)
  expect(reads.every((size: number) => size === 1)).toBe(true)
  await page.evaluate(() => (window as any)._artbotDb.completed.clear())
  await page.locator('#file-upload').setInputFiles({
    name: 'large-backup.json',
    mimeType: 'application/json',
    buffer: backup
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible({ timeout: 30000 })
  const restored = await page.evaluate(async () => {
    const rows = await (window as any)._artbotDb.completed.toArray()
    const first = rows.find((row: any) => row.jobId === 'large-backup-0')
    const digest = await crypto.subtle.digest(
      'SHA-256',
      await first.payload.arrayBuffer()
    )
    return {
      count: rows.length,
      unique: new Set(rows.map((row: any) => row.jobId)).size,
      favorites: rows.filter((row: any) => row.favorited).length,
      blobSha: Array.from(new Uint8Array(digest))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    }
  })
  expect(restored).toEqual({
    count: 1700,
    unique: 1700,
    favorites: 850,
    blobSha: sha(Buffer.alloc(1024 * 1024, 137))
  })
})

test('a database export restores deleted images, source data and a nested Blob', async ({
  page
}) => {
  test.setTimeout(120000)
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (rows) => {
    rows[0].fixturePayload = {
      blob: new Blob([new Uint8Array(1024 * 1024).fill(137)], {
        type: 'application/octet-stream'
      })
    }
    await (window as any)._artbotDb.completed.bulkAdd(rows)
  }, fixtures)
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  const downloaded = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloaded
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const backup = Buffer.concat(chunks)
  expect(JSON.parse(backup.toString()).formatName).toBe('dexie')

  await page.goto('/artbot/images')
  await page.getByTitle('Select Images', { exact: true }).click()
  for (const [index, row] of fixtures.slice(0, 2).entries()) {
    await page.getByAltText(row.prompt, { exact: true }).first().click()
    await expect(
      page.getByText(`selected (${index + 1})`, { exact: true })
    ).toBeVisible()
  }
  await page.getByText('DELETE (2)?', { exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete', exact: true })
    .click()
  await expect
    .poll(() =>
      page.evaluate(() => (window as any)._artbotDb.completed.count())
    )
    .toBe(1)
  expect(
    await page.evaluate(() =>
      (window as any)._artbotDb.completed
        .toArray()
        .then((rows: any[]) => rows.map((r) => r.jobId))
    )
  ).toEqual([fixtures[2].jobId])

  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  await page.locator('#file-upload').setInputFiles({
    name: 'roundtrip.json',
    mimeType: 'application/json',
    buffer: backup
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible({ timeout: 60000 })
  await expect
    .poll(() =>
      page.evaluate(() => (window as any)._artbotDb.completed.count())
    )
    .toBe(3)
  const restored = await page.evaluate(async () => {
    const digest = async (bytes: ArrayBuffer | Uint8Array<ArrayBuffer>) =>
      Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (n) => n.toString(16).padStart(2, '0')
      ).join('')
    const rows = await (window as any)._artbotDb.completed.toArray()
    return Promise.all(
      rows.map(async (r: any) => ({
        jobId: r.jobId,
        fields: await Promise.all(
          [
            'base64String',
            'thumbnail',
            'source_image',
            'source_mask',
            'canvasData',
            'maskData'
          ].map(async (key) => [
            key,
            await digest(
              new TextEncoder().encode(JSON.stringify(r[key] ?? null))
            )
          ])
        ),
        blob: r.fixturePayload
          ? {
              type: r.fixturePayload.blob.type,
              size: r.fixturePayload.blob.size,
              sha256: await digest(await r.fixturePayload.blob.arrayBuffer())
            }
          : null
      }))
    )
  })
  for (const original of fixtures) {
    const row = restored.find((r) => r.jobId === original.jobId)!
    expect(Object.fromEntries(row.fields)).toEqual(
      Object.fromEntries(
        [
          'base64String',
          'thumbnail',
          'source_image',
          'source_mask',
          'canvasData',
          'maskData'
        ].map((key) => [key, sha(JSON.stringify(original[key] ?? null))])
      )
    )
  }
  expect(restored.find((r) => r.jobId === fixtures[0].jobId)!.blob).toEqual({
    type: 'application/octet-stream',
    size: 1024 * 1024,
    sha256: sha(Buffer.alloc(1024 * 1024, 137))
  })
})

// Made by the deployed site (Dexie 3, dexie-export-import 4.0.7) with
// e2e/fixtures/makeLegacyBackup.mjs. It stands in for backups users saved.
const legacyBackup = readFileSync(
  path.join(__dirname, 'fixtures/legacy-backup.json')
)
const LEGACY_BLOB_SHA = sha(
  Buffer.from(Uint8Array.from({ length: 4096 }, (_, i) => (i * 37) % 256))
)

test('a backup saved by the deployed site restores every table exactly', async ({
  page
}) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add(row)
  }, fixtures[0])
  await finishFixtureSetup(page)

  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  await page.locator('#file-upload').setInputFiles({
    name: 'legacy-backup.json',
    mimeType: 'application/json',
    buffer: legacyBackup
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible({ timeout: 60000 })

  // Read the stored rows natively: Dexie's reading hook upgrades old rows.
  const stored = await page.evaluate(async () => {
    const idb: IDBDatabase = await new Promise((resolve, reject) => {
      const request = indexedDB.open((window as any)._artbotDb.name)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const names = Array.from(idb.objectStoreNames)
    const transaction = idb.transaction(names, 'readonly')
    const tables: Record<string, any[]> = {}
    for (const name of names) {
      tables[name] = await new Promise((resolve, reject) => {
        const request = transaction.objectStore(name).getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }
    let blob = null
    for (const row of tables.completed) {
      if (row.payload instanceof Blob) {
        const digest = await crypto.subtle.digest(
          'SHA-256',
          await row.payload.arrayBuffer()
        )
        blob = {
          jobId: row.jobId,
          type: row.payload.type,
          sha256: Array.from(new Uint8Array(digest), (n) =>
            n.toString(16).padStart(2, '0')
          ).join('')
        }
        delete row.payload
      }
    }
    const version = idb.version
    idb.close()
    return { version, tables, blob }
  })

  // The new site still uses the deployed site's database version.
  expect(stored.version).toBe(60)
  const exported = JSON.parse(legacyBackup.toString())
  const expected = Object.fromEntries(
    exported.data.data.map((table: any) => [
      table.tableName,
      // The Blob and its type tag are checked separately.
      table.rows.map((row: any) => {
        const copy = { ...row }
        delete copy.$types
        delete copy.payload
        return copy
      })
    ])
  )
  // The existing image was replaced, not merged.
  expect(stored.tables).toEqual(expected)
  expect(stored.blob).toEqual({
    jobId: 'img2img-with-blob',
    type: 'application/octet-stream',
    sha256: LEGACY_BLOB_SHA
  })

  // New images continue after the restored ids, and the oldest row still
  // opens in the app.
  expect(
    await page.evaluate(() =>
      (window as any)._artbotDb.completed.add({
        jobId: 'after-restore',
        timestamp: 1800000000000
      })
    )
  ).toBe(6)
  await page.goto('/artbot/image/legacy-model-string')
  await expect(
    page.getByText('a lighthouse in fog', { exact: false }).first()
  ).toBeVisible()
})

test('importing a full database replaces an existing image', async ({
  page
}) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add(row)
  }, fixtures[0])
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloading
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  await page.evaluate(async () => {
    await (window as any)._artbotDb.completed
      .toCollection()
      .modify({ prompt: 'changed after export' })
  })
  await page.locator('#file-upload').setInputFiles({
    name: 'replace.json',
    mimeType: 'application/json',
    buffer: Buffer.concat(chunks)
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible({ timeout: 60000 })
  expect(
    await page.evaluate(async () =>
      (await (window as any)._artbotDb.completed.toArray()).map(
        (r: any) => r.prompt
      )
    )
  ).toEqual([fixtures[0].prompt])
})

test('a failing database replacement rolls back all changes', async ({
  page
}) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add(row)
  }, fixtures[0])
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloading
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const backup = JSON.parse(Buffer.concat(chunks).toString())
  const table = backup.data.data.find((t: any) => t.tableName === 'completed')
  table.rows.push(structuredClone(table.rows[0]))
  backup.data.tables.find((t: any) => t.name === 'completed').rowCount = 2
  await page.evaluate(async () => {
    await (window as any)._artbotDb.completed
      .toCollection()
      .modify({ prompt: 'newer data must survive' })
  })
  await page.locator('#file-upload').setInputFiles({
    name: 'invalid-duplicate-keys.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup))
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText(
      'Unable to import this database. Your existing data has been kept.',
      { exact: false }
    )
  ).toBeVisible()
  expect(
    await page.evaluate(async () =>
      (await (window as any)._artbotDb.completed.toArray()).map(
        (r: any) => r.prompt
      )
    )
  ).toEqual(['newer data must survive'])
})

test('restoring an empty database removes current images', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add(row)
  }, fixtures[0])
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloading
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const empty = JSON.parse(Buffer.concat(chunks).toString())
  for (const table of empty.data.data) table.rows = []
  for (const table of empty.data.tables) table.rowCount = 0
  await page.locator('#file-upload').setInputFiles({
    name: 'empty.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(empty))
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible({ timeout: 30000 })
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(0)
})

test('a truncated backup leaves the current database intact', async ({
  page
}) => {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() =>
    Boolean((window as any)._artbotDb?.completed)
  )
  await page.evaluate(async (row) => {
    await (window as any)._artbotDb.completed.add(row)
  }, fixtures[0])
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page
    .getByText('Legacy compatibility JSON export', { exact: true })
    .click()
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download database', exact: true })
    .click()
  const download = await downloading
  const chunks: Buffer[] = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const backup = Buffer.concat(chunks).toString()
  const firstRows = /"rows"\s*:\s*\[/.exec(backup)!
  const partial = backup.slice(0, firstRows.index + firstRows[0].length)
  await page.locator('#file-upload').setInputFiles({
    name: 'truncated.json',
    mimeType: 'application/json',
    buffer: Buffer.from(partial)
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText(
      'Unable to import this database. Your existing data has been kept.',
      { exact: false }
    )
  ).toBeVisible()
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})
