/**
 * Settings pages, with the AI Horde mocked.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'
import { chooseRestoreFiles, openBackupOptions } from './backupUi'

const library = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures/library.json'), 'utf8')
)

test('the worker search boxes are at most 480px wide', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await mockBackend(page)
  await page.goto('/artbot/settings')

  const labels = page.getByText('Search by worker name or worker ID:')
  await expect(labels.first()).toBeVisible()
  const count = await labels.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const width = await labels
      .nth(i)
      .evaluate((label) => label.parentElement!.getBoundingClientRect().width)
    expect(width).toBeLessThanOrEqual(480)
  }
})

test.describe('the last resort JSON import', () => {
  // Fixture-only fields, and the table id, which the import assigns itself.
  const image = { ...library.completed[0] }
  delete image.fixtureName
  delete image.id
  const file = {
    name: 'images.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([image]))
  }

  test('imports a file, and can import the same file again', async ({
    page
  }) => {
    const errors = trackPageErrors(page)
    await mockBackend(page)
    await page.goto('/artbot/settings?panel=import-export')
    const count = () =>
      page.evaluate(() => (window as any)._artbotDb.completed.count())

    for (let attempt = 0; attempt < 2; attempt++) {
      await chooseRestoreFiles(page, file)
      await page
        .getByRole('button', { name: 'Restore library', exact: true })
        .click()
      await expect(
        page.getByText('ArtBot database imported!', { exact: false })
      ).toBeVisible()
      await page.waitForFunction(() => (window as any)._artbotDb?.isOpen())
      await expect.poll(count).toBe(1)
    }

    // A successful restore reloads the page. The fresh picker must still
    // accept the same external file on the next attempt.
    await expect(
      page.getByLabel('Choose backup files', { exact: true })
    ).toHaveValue('')

    await openBackupOptions(page)
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
    expect(JSON.parse(Buffer.concat(chunks).toString()).data.databaseName).toBe(
      'imageHorde'
    )

    expect(errors).toEqual([])
  })

  test('ignores a selection with no file in it', async ({ page }) => {
    const errors = trackPageErrors(page)
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    await mockBackend(page)
    await page.goto('/artbot/settings?panel=import-export')
    const input = page.getByLabel('Choose backup files', { exact: true })

    await input.setInputFiles([])
    await page.waitForTimeout(500)

    expect(consoleErrors.filter((text) => text.includes('JSON'))).toEqual([])
    expect(errors).toEqual([])
  })
})
