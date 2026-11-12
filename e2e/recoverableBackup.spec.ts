import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, test as base } from '@playwright/test'
import { mockBackend, finishFixtureSetup } from './helpers'
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

test('saved multipart files verify and restore binary source data, preferences and favorites, then roll back', async ({
  page,
  context
}, info) => {
  test.setTimeout(
    process.env.BACKUP_STRESS_ROWS
      ? 900000
      : info.project.name === 'webkit'
        ? 600000
        : 240000
  )
  const backend = await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() => !!(window as any)._artbotDb)
  const bytesPerRow = Number(
    process.env.BACKUP_STRESS_BYTES || 12 * 1024 * 1024
  )
  const rows = Number(process.env.BACKUP_STRESS_ROWS || 3)
  await page.evaluate(
    async ({ bytesPerRow, rows }) => {
      const db = (window as any)._artbotDb
      localStorage.setItem(
        'favoriteLoras',
        JSON.stringify([{ id: 123, name: 'remember this' }])
      )
      localStorage.setItem(
        'CustomDimensions',
        JSON.stringify([['wide', 1024, 640]])
      )
      for (let i = 0; i < rows; i++)
        await db.completed.add({
          jobId: `binary-${i}`,
          timestamp: 1700000000000 + i,
          model: 'legacy-only-model',
          prompt: 'a dog in sunlight',
          favorited: i % 2 === 0,
          source_image: new Blob([new Uint8Array(bytesPerRow).fill(37 + i)], {
            type: 'image/test'
          }),
          source_mask: new Blob([new Uint8Array([1, 2, 3])]),
          payload: new Date('2020-01-02T00:00:00Z')
        })
      localStorage.setItem(
        'appConfig',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('appConfig') || '{}'),
          theme: 'dark',
          apiKey: 'device-private-key'
        })
      )
    },
    { bytesPerRow, rows }
  )
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page.evaluate(async () => {
    const config = JSON.parse(localStorage.getItem('appConfig') || '{}')
    localStorage.setItem(
      'appConfig',
      JSON.stringify({ ...config, pauseJobQueue: true })
    )
    await (window as any)._artbotDb.pending.bulkAdd([
      {
        jobId: 'remember-requested',
        jobStatus: 'requested',
        timestamp: 1700000000000,
        prompt: 'keep requested state',
        params: {}
      },
      {
        jobId: 'remember-waiting',
        jobStatus: 'waiting',
        timestamp: 1700000000001,
        prompt: 'keep waiting state',
        params: {}
      }
    ])
  })
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible({
    timeout: process.env.BACKUP_STRESS_ROWS
      ? 600000
      : info.project.name === 'webkit'
        ? 300000
        : 120000
  })
  await page.screenshot({
    path: info.outputPath('backup-settings.png'),
    fullPage: true
  })
  const downloads = page.getByRole('button', {
    name: /^Save (manifest|part \d+)/
  })
  const paths: string[] = []
  for (let i = 0; i < (await downloads.count()); i++) {
    const downloading = page.waitForEvent('download')
    await downloads.nth(i).click()
    const file = await downloading
    const path = info.outputPath(file.suggestedFilename())
    await file.saveAs(path)
    paths.push(path)
    if (i === 0) {
      await page.reload()
      await expect(
        page.getByText('Recovered prepared backup.', { exact: false })
      ).toBeVisible({ timeout: 30000 })
    }
  }
  expect(paths.length).toBeGreaterThan(2)
  const manifest = JSON.parse(readFileSync(paths[0], 'utf8'))
  expect(manifest.records).toBeGreaterThanOrEqual(rows)
  expect(manifest.credentialsIncluded).toBe(false)
  expect(JSON.stringify(manifest)).not.toContain('device-private-key')
  for (let i = 1; i < paths.length; i++) {
    const bytes = readFileSync(paths[i])
    expect(bytes.length).toBeLessThanOrEqual(8 * 1048576)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      manifest.parts[i - 1].sha256
    )
  }
  await page
    .getByLabel('Verify saved backup', { exact: true })
    .setInputFiles(paths)
  await expect(
    page.getByText('Saved backup verified:', { exact: false })
  ).toBeVisible({
    timeout: process.env.BACKUP_STRESS_ROWS
      ? 600000
      : info.project.name === 'webkit'
        ? 300000
        : 120000
  })
  await page
    .getByLabel('Choose backup files', { exact: true })
    .setInputFiles(paths.slice(0, -1))
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('Your existing data has been kept.', { exact: false })
  ).toBeVisible()
  expect(await page.evaluate(() => (window as any)._artbotDb.name)).toBe(
    'imageHorde'
  )
  const other = await context.newPage()
  await mockBackend(other)
  await other.goto('/artbot/settings?panel=import-export')
  await page
    .getByLabel('Choose backup files', { exact: true })
    .setInputFiles(paths)
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByText('ArtBot database imported!', { exact: false })
  ).toBeVisible({
    timeout: process.env.BACKUP_STRESS_ROWS
      ? 600000
      : info.project.name === 'webkit'
        ? 300000
        : 120000
  })
  await other.waitForFunction(() =>
    /^artbot-restored-/.test((window as any)._artbotDb?.name || '')
  )
  const restored = await page.evaluate(async () => {
    const db = (window as any)._artbotDb
    const raw: IDBDatabase = await new Promise((resolve, reject) => {
      const r = indexedDB.open(db.name)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    const rows: any[] = await new Promise((resolve, reject) => {
      const r = raw.transaction('completed').objectStore('completed').getAll()
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    const pending: any[] = await new Promise((resolve, reject) => {
      const r = raw.transaction('pending').objectStore('pending').getAll()
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    raw.close()
    const first = rows.find((r) => r.jobId === 'binary-0')
    const digest = [
      ...new Uint8Array(
        await crypto.subtle.digest(
          'SHA-256',
          await first.source_image.arrayBuffer()
        )
      )
    ]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
    return {
      pending: pending.map((r) => [r.jobId, r.jobStatus]),
      count: rows.length,
      favorite: rows.filter((r) => r.favorited).length,
      size: first.source_image.size,
      type: first.source_image.type,
      model: first.model,
      modelsPresent: 'models' in first,
      when: first.payload.toISOString(),
      digest,
      preferences: JSON.parse(localStorage.getItem('appConfig')!)
    }
  })
  expect(restored).toMatchObject({
    count: rows,
    favorite: Math.ceil(rows / 2),
    size: bytesPerRow,
    type: 'image/test',
    model: 'legacy-only-model',
    modelsPresent: false,
    when: '2020-01-02T00:00:00.000Z',
    digest: createHash('sha256')
      .update(Buffer.alloc(bytesPerRow, 37))
      .digest('hex')
  })
  expect(restored.preferences.apiKey).toBe('device-private-key')
  expect(restored.pending).toEqual([
    ['remember-requested', 'requested'],
    ['remember-waiting', 'waiting']
  ])
  expect(backend.submissions).toHaveLength(0)
  expect(
    await page.evaluate(() => localStorage.getItem('favoriteLoras'))
  ).toContain('remember this')
  await expect(
    page.getByRole('button', { name: 'Resume restored requests' })
  ).toBeVisible()
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.getByRole('button', { name: 'Return to previous library' }).click()
  ])
  await page.waitForFunction(
    () => (window as any)._artbotDb?.name === 'imageHorde'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(rows)
  await other.close()
})

test('a reopened private preparation still discloses credentials independently of the new-backup checkbox', async ({
  page
}) => {
  test.setTimeout(120000)
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() => !!(window as any)._artbotDb)
  await page.evaluate(() =>
    localStorage.setItem(
      'appConfig',
      JSON.stringify({ v: '1', apiKey: 'private-disclosure-fixture' })
    )
  )
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
  await page.getByRole('checkbox', { name: /Include API keys/ }).check()
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('This prepared backup includes API keys.', { exact: false })
  ).toBeVisible({ timeout: 30000 })
  await page.reload()
  await expect(
    page.getByText('This prepared backup includes API keys.', { exact: false })
  ).toBeVisible({ timeout: 30000 })
  await expect(
    page.getByRole('checkbox', { name: /Include API keys/ })
  ).not.toBeChecked()
})
