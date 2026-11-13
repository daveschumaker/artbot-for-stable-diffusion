import {
  backupEntries,
  chooseVerificationFiles,
  chooseRestoreFiles,
  selectBackupFile,
  openBackupOptions,
  restoreRejected
} from './backupUi'
import { expect, test, BrowserContext } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { finishFixtureSetup, mockBackend, trackPageErrors } from './helpers'
import {
  makeFixture,
  auditLibrary,
  assertFresh,
  assertFixture,
  favoriteLoras
} from '../scripts/ios-pwa/fixture.cjs'

test('saved files recover a fresh installation; rejected backups preserve it and valid retries roll back', async ({
  playwright,
  browserName,
  baseURL
}, info) => {
  test.setTimeout(180000)
  const fixture = await makeFixture()
  const contexts: BrowserContext[] = []
  const errors: string[][] = []
  const open = async (name: string) => {
    const context = await playwright[browserName].launchPersistentContext(
      info.outputPath(name),
      { headless: true, baseURL }
    )
    contexts.push(context)
    const page = await context.newPage()
    await mockBackend(page)
    errors.push(trackPageErrors(page))
    await page.goto('/artbot/settings?panel=import-export')
    await expect(
      page.getByRole('button', { name: 'Prepare backup', exact: true })
    ).toBeVisible()
    return page
  }
  try {
    const source = await open('source')
    await chooseRestoreFiles(source, {
      name: 'synthetic-library.json',
      mimeType: 'application/json',
      buffer: fixture.buffer
    })
    await source
      .getByRole('button', { name: 'Restore library', exact: true })
      .click()
    await expect(
      source.getByText('ArtBot database imported!', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    await source.evaluate(
      (value) => localStorage.setItem('favoriteLoras', value),
      favoriteLoras
    )
    await source
      .getByRole('button', { name: 'Prepare backup', exact: true })
      .click()
    await expect(
      source.getByText('Prepared locally.', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    const labels = await backupEntries(source).evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-backup-file-label')!)
    )
    const paths: string[] = []
    expect(labels.length).toBeGreaterThan(2)
    for (const label of labels) {
      const save = await selectBackupFile(source, label)
      const [download] = await Promise.all([
        source.waitForEvent('download'),
        save.click()
      ])
      const file = info.outputPath(download.suggestedFilename())
      await download.saveAs(file)
      paths.push(file)
    }
    await finishFixtureSetup(source)
    // Close the source before recovery. Only the downloaded files cross profiles.
    await source.context().close()
    const target = await open('fresh-destination')
    assertFresh(await target.evaluate(auditLibrary))
    await chooseVerificationFiles(target, paths)
    await expect(
      target.getByText('Saved backup verified:', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    expect((await target.evaluate(auditLibrary)).preparations).toBe(0)
    await chooseRestoreFiles(target, paths)
    await target
      .getByRole('button', { name: 'Restore library', exact: true })
      .click()
    await expect(
      target.getByText('ArtBot database imported!', { exact: false })
    ).toBeVisible({ timeout: 90000 })
    assertFixture(await target.evaluate(auditLibrary), fixture.expected)
    const original = await target.evaluate(auditLibrary)
    const verifiedAt = await target.evaluate(() =>
      localStorage.getItem('ArtBotLibrarySelection:lastVerified')
    )
    const damaged = await Promise.all(
      paths.map(async (file, index) => {
        const buffer = Buffer.from(await readFile(file))
        if (index === 1) buffer[Math.floor(buffer.length / 2)] ^= 1
        return {
          name: path.basename(file),
          mimeType: 'application/octet-stream',
          buffer
        }
      })
    )
    for (const scenario of [
      {
        files: paths.slice(0, -1),
        error: 'Missing, duplicate or unexpected backup files'
      },
      { files: damaged, error: 'Missing or damaged backup part 1' }
    ]) {
      await chooseVerificationFiles(target, scenario.files)
      await expect(
        target.getByRole('status').filter({ hasText: scenario.error })
      ).toBeVisible()
      expect(
        await target.evaluate(() =>
          localStorage.getItem('ArtBotLibrarySelection:lastVerified')
        )
      ).toBe(verifiedAt)
      await chooseRestoreFiles(target, scenario.files)
      await restoreRejected(target, scenario.error)
      const kept = await target.evaluate(auditLibrary)
      assertFixture(kept, fixture.expected)
      expect(kept.name).toBe(original.name)
      expect(kept.selection).toEqual(original.selection)
    }
    // A file provider may revoke access before ArtBot can hash the selected
    // bytes. Treat that separately from a readable file with a bad checksum.
    await target.evaluate(() => {
      const descriptor = Object.getOwnPropertyDescriptor(File.prototype, 'text')
      ;(window as any).__restoreFileRead = () => {
        if (descriptor)
          Object.defineProperty(File.prototype, 'text', descriptor)
        else delete (File.prototype as any).text
      }
      File.prototype.text = async () => {
        throw new DOMException(
          'The object can not be found here.',
          'NotFoundError'
        )
      }
    })
    try {
      await chooseVerificationFiles(target, paths)
      await expect(
        target
          .getByRole('status')
          .filter({ hasText: 'A selected backup file could not be read.' })
      ).toContainText('Choose the saved files again.')
      await chooseRestoreFiles(target, paths)
      await restoreRejected(target, 'A selected backup file could not be read.')
      const kept = await target.evaluate(auditLibrary)
      assertFixture(kept, fixture.expected)
      expect(kept.selection).toEqual(original.selection)
      expect(kept.lastVerified).toEqual(original.lastVerified)
    } finally {
      await target.evaluate(() => {
        ;(window as any).__restoreFileRead()
        delete (window as any).__restoreFileRead
      })
    }
    // Inject platform responses rather than filling the developer's disk.
    await target.evaluate(() => {
      const storage = navigator.storage
      const original = {
        estimate: storage.estimate,
        persisted: storage.persisted,
        persist: storage.persist
      }
      ;(window as any).__restoreStorageAPI = () =>
        Object.assign(storage, original)
      storage.estimate = async () => ({ usage: 4096, quota: 4096 })
      storage.persisted = async () => false
      storage.persist = async () => false
    })
    try {
      await chooseRestoreFiles(target, paths)
      await restoreRejected(target, 'Not enough estimated storage')
      assertFixture(await target.evaluate(auditLibrary), fixture.expected)
      expect((await target.evaluate(auditLibrary)).selection).toEqual(
        original.selection
      )
      await openBackupOptions(target)
      await target
        .getByRole('button', {
          name: 'Request persistent storage',
          exact: true
        })
        .click()
      await expect(
        target
          .getByRole('status')
          .filter({ hasText: 'Persistence was not granted.' })
      ).toBeVisible()
      assertFixture(await target.evaluate(auditLibrary), fixture.expected)
    } finally {
      await target.evaluate(() => {
        ;(window as any).__restoreStorageAPI?.()
        delete (window as any).__restoreStorageAPI
      })
    }
    await finishFixtureSetup(target)
    await target.reload()
    await expect(
      target.getByRole('button', { name: 'Return to previous library' })
    ).toBeVisible()
    assertFixture(await target.evaluate(auditLibrary), fixture.expected)
    expect((await target.evaluate(auditLibrary)).name).toBe(original.name)
    await chooseRestoreFiles(target, paths)
    await target
      .getByRole('button', { name: 'Restore library', exact: true })
      .click()
    await target.waitForFunction(
      (name) => (window as any)._artbotDb?.name !== name,
      original.name
    )
    assertFixture(await target.evaluate(auditLibrary), fixture.expected)
    await target
      .getByRole('button', { name: 'Return to previous library' })
      .click()
    await target.waitForFunction(
      (name) => (window as any)._artbotDb?.name === name,
      original.name
    )
    assertFixture(await target.evaluate(auditLibrary), fixture.expected)
    await target
      .getByRole('button', { name: 'Return to previous library' })
      .click()
    await target.waitForFunction(
      () => (window as any)._artbotDb?.name === 'imageHorde'
    )
    const rolledBack = await target.evaluate(auditLibrary)
    expect(Object.values(rolledBack.counts).every((count) => count === 0)).toBe(
      true
    )
    expect(rolledBack.preparations).toBe(0)
    expect(rolledBack.favoriteLoras).toBeNull()
    await finishFixtureSetup(target)
    expect(errors.flat()).toEqual([])
  } finally {
    for (const context of contexts) await context.close()
  }
})
