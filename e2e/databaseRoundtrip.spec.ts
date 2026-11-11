import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test as base } from '@playwright/test'
import { mockBackend, finishFixtureSetup } from './helpers'

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
  await page.locator('#file-upload').setInputFiles({
    name: 'roundtrip.json',
    mimeType: 'application/json',
    buffer: backup
  })
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible()
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
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible()
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
  await expect(
    page.getByText(
      'Unable to import this database. Your existing data has been kept.',
      { exact: true }
    )
  ).toBeVisible()
  expect(
    await page.evaluate(async () =>
      (await (window as any)._artbotDb.completed.toArray()).map(
        (r: any) => r.prompt
      )
    )
  ).toEqual(['newer data must survive'])
  await expect(page.locator('#file-upload')).toHaveValue('')
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
  await expect(
    page.getByText('ArtBot database imported!', { exact: false }).first()
  ).toBeVisible()
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
  await expect(
    page.getByText(
      'Unable to import this database. Your existing data has been kept.',
      { exact: true }
    )
  ).toBeVisible()
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})
