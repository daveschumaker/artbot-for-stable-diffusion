import {
  chooseVerificationFiles,
  backupEntries,
  selectBackupFile
} from './backupUi'
import { expect, test, Page } from '@playwright/test'
import { finishFixtureSetup, mockBackend, trackPageErrors } from './helpers'

test('saved-file batches survive cold reopen and the home page leads back to the exact backup', async ({
  playwright,
  browserName,
  baseURL
}, info) => {
  test.setTimeout(180000)
  const profile = info.outputPath('profile')
  const viewport = { width: 390, height: 844 }
  let context = await playwright[browserName].launchPersistentContext(profile, {
    headless: true,
    baseURL,
    viewport
  })
  const errors: string[][] = []
  const setup = async () => {
    const page = await context.newPage()
    // The reminder is an opt-in lab feature on local origins only.
    await page.addInitScript(() => localStorage.setItem('ArtBotBackupLab', '1'))
    errors.push(trackPageErrors(page))
    await mockBackend(page)
    return page
  }
  const save = async (page: Page, name: RegExp) => {
    const label = name.source.includes('manifest')
      ? 'manifest'
      : 'part ' + name.source.match(/part (\d+)/)![1]
    const button = await selectBackupFile(page, label)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      button.click()
    ])
    const path = info.outputPath(download.suggestedFilename())
    await download.saveAs(path)
    return path
  }
  try {
    let page = await setup()
    await page.goto('/artbot/images')
    await page.waitForFunction(() => !!(window as any)._artbotDb)
    await page.evaluate(async () => {
      await (window as any)._artbotDb.completed.add({
        jobId: 'handoff-source',
        prompt: 'a remembered dog',
        favorited: true,
        source_image: new Blob([new Uint8Array(7 * 1048576).fill(93)]),
        source_mask: new Blob([new Uint8Array([1, 4, 9])]),
        timestamp: Date.now()
      })
    })
    await finishFixtureSetup(page)
    await page.goto('/artbot/settings?panel=import-export')
    await page
      .getByRole('button', { name: 'Prepare backup', exact: true })
      .click()
    await expect(
      page.getByText('Prepared locally.', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    const fileCount = await backupEntries(page).count()
    expect(fileCount).toBeGreaterThan(2)
    const paths = [await save(page, /^Save manifest \(/)]
    await chooseVerificationFiles(page, paths)
    await expect(
      page.getByText(`Verified 1 of ${fileCount} saved files.`, {
        exact: false
      })
    ).toBeVisible()
    expect(
      await page.evaluate(() =>
        localStorage.getItem('ArtBotLibrarySelection:lastVerified')
      )
    ).toBeNull()
    await page.screenshot({
      path: info.outputPath('partial-verification.png'),
      fullPage: true
    })
    const originalNames = await backupEntries(page).allTextContents()
    await finishFixtureSetup(page)
    await context.close()
    context = await playwright[browserName].launchPersistentContext(profile, {
      headless: true,
      baseURL,
      viewport
    })
    page = await setup()
    await page.goto('/artbot')
    await expect(
      page.getByRole('link', { name: 'Continue backup', exact: true })
    ).toBeVisible({ timeout: 10000 })
    const reminderBox = await page
      .getByRole('complementary', { name: 'Unfinished backup' })
      .boundingBox()
    const headerBox = await page.getByRole('banner').boundingBox()
    expect(reminderBox!.y).toBeGreaterThanOrEqual(
      headerBox!.y + headerBox!.height
    )
    await page.screenshot({
      path: info.outputPath('resume-on-home.png'),
      fullPage: true
    })
    await page
      .getByRole('link', { name: 'Continue backup', exact: true })
      .click()
    await expect(
      page.getByText(`1 of ${fileCount} saved files verified`, { exact: false })
    ).toBeVisible()
    expect(await backupEntries(page).allTextContents()).toEqual(originalNames)
    for (let i = 1; i < fileCount; i++) {
      const path = await save(page, new RegExp(`^Save part ${i} \\(`))
      paths.push(path)
      await chooseVerificationFiles(page, path)
      if (i < fileCount - 1)
        await expect(
          page.getByText(`Verified ${i + 1} of ${fileCount} saved files.`, {
            exact: false
          })
        ).toBeVisible()
    }
    await expect(
      page.getByText('Saved backup verified:', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    await finishFixtureSetup(page)
    await page.goto('/artbot')
    await expect(
      page.getByRole('link', { name: 'Continue backup', exact: true })
    ).toHaveCount(0)
    await finishFixtureSetup(page)
    await page.goto('/artbot/settings?panel=import-export')
    await page
      .getByLabel('Choose backup files', { exact: true })
      .setInputFiles(paths)
    await page
      .getByRole('button', { name: 'Restore library', exact: true })
      .click()
    await expect(
      page.getByText('ArtBot database imported!', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    const restored = await page.evaluate(async () => {
      const row = await (window as any)._artbotDb.completed
        .where('jobId')
        .equals('handoff-source')
        .first()
      const bytes = new Uint8Array(await row.source_image.arrayBuffer())
      return {
        favorited: row.favorited,
        bytes: bytes.length,
        first: bytes[0],
        last: bytes.at(-1),
        mask: Array.from(new Uint8Array(await row.source_mask.arrayBuffer()))
      }
    })
    expect(restored).toEqual({
      favorited: true,
      bytes: 7 * 1048576,
      first: 93,
      last: 93,
      mask: [1, 4, 9]
    })
    await page
      .getByRole('button', { name: 'Return to previous library' })
      .click()
    await page.waitForFunction(
      () => (window as any)._artbotDb?.name === 'imageHorde'
    )
    expect(
      await page.evaluate(() => (window as any)._artbotDb.completed.count())
    ).toBe(1)
    expect(errors.flat()).toEqual([])
  } finally {
    await context.close()
  }
})
