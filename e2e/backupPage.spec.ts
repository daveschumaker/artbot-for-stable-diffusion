import { expect, test as base, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { mockBackend, finishFixtureSetup, createTestImage } from './helpers'
import { chooseRestoreFiles, chooseVerificationFiles } from './backupUi'

const test = base.extend({
  context: async ({ playwright, browserName, baseURL }, runTest, info) => {
    const context = await playwright[browserName].launchPersistentContext(
      info.outputPath('profile'),
      { headless: true, baseURL, viewport: { width: 390, height: 844 } }
    )
    try {
      await runTest(context)
    } finally {
      await context.close()
    }
  }
})

async function openLibrary(page: Page, bytes = 32) {
  await mockBackend(page)
  await page.goto('/artbot/images')
  await page.waitForFunction(() => !!(window as any)._artbotDb)
  await page.evaluate(async (bytes) => {
    await (window as any)._artbotDb.completed.add({
      jobId: 'backup-page-fixture',
      prompt: 'a remembered dog',
      favorited: true,
      source_image: new Blob([new Uint8Array(bytes).fill(42)]),
      timestamp: Date.now()
    })
  }, bytes)
  await finishFixtureSetup(page)
  await page.goto('/artbot/settings?panel=import-export')
}

test('backup inventory opens without constructing data parts and loads only the selected part', async ({
  page
}, info) => {
  test.setTimeout(120000)
  await page.addInitScript(() => {
    ;(window as any).__backupPartFiles = []
    window.File = new Proxy(File, {
      construct(target, args, newTarget) {
        if (String(args[1]).endsWith('.artbot-part'))
          (window as any).__backupPartFiles.push(args[1])
        return Reflect.construct(target, args, newTarget)
      }
    })
  })
  await openLibrary(page, 7 * 1048576)
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible({ timeout: 90000 })
  expect(await page.evaluate(() => (window as any).__backupPartFiles)).toEqual(
    []
  )
  await page.reload()
  await expect(
    page.getByRole('region', { name: 'Backup file checklist' })
  ).toBeVisible()
  expect(await page.evaluate(() => (window as any).__backupPartFiles)).toEqual(
    []
  )
  await page.getByRole('button', { name: 'Select part 1', exact: true }).click()
  await expect(
    page.getByRole('button', { name: /^Save part 1 \(/ })
  ).toBeEnabled()
  expect(
    await page.evaluate(() => (window as any).__backupPartFiles.length)
  ).toBe(1)
  await page.screenshot({
    path: info.outputPath('backup-mobile.png'),
    fullPage: false
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({
    path: info.outputPath('backup-desktop.png'),
    fullPage: false
  })
})

test('restore preview identifies missing parts before allowing restore and keeps the current library', async ({
  page
}, info) => {
  await openLibrary(page)
  const fixture = JSON.parse(
    readFileSync(path.join(__dirname, 'fixtures/backup-v1.json'), 'utf8')
  )
  const file = fixture.files.find((file: any) =>
    file.name.endsWith('.manifest.json')
  )
  const bytes = Buffer.from(file.base64, 'base64')
  const manifest = JSON.parse(bytes.toString())
  await page.getByLabel('Choose backup files', { exact: true }).setInputFiles({
    name: file.name,
    mimeType: 'application/json',
    buffer: bytes
  })
  const preview = page.getByRole('region', { name: 'Restore preview' })
  await expect(preview).toContainText('Missing')
  await expect(preview).toContainText(manifest.parts[0].name)
  await expect(
    page.getByRole('button', { name: 'Restore library', exact: true })
  ).toBeDisabled()
  expect(await page.evaluate(() => (window as any)._artbotDb.name)).toBe(
    'imageHorde'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
  await preview.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath('restore-preview-mobile.png'),
    fullPage: false
  })
  const part = fixture.files.find((file: any) =>
    file.name.endsWith('.artbot-part')
  )
  await page.getByLabel('Choose backup files', { exact: true }).setInputFiles({
    name: part.name,
    mimeType: 'application/octet-stream',
    buffer: Buffer.from(part.base64, 'base64')
  })
  await expect(preview).toContainText('Select the backup manifest')
  await expect(
    page.getByRole('button', { name: 'Restore library', exact: true })
  ).toBeDisabled()
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})

test('zero-byte Files selections preserve the library and verification timestamp until valid copies are reselected', async ({
  page
}) => {
  await openLibrary(page)
  const fixture = JSON.parse(
    readFileSync(path.join(__dirname, 'fixtures/backup-v1.json'), 'utf8')
  )
  const files = fixture.files.map((file: any) => ({
    name: file.name,
    mimeType: file.type,
    buffer: Buffer.from(file.base64, 'base64')
  }))
  const unavailable = files.map((file: any) =>
    file.name.endsWith('.artbot-part')
      ? { ...file, buffer: Buffer.alloc(0) }
      : file
  )
  const current = () =>
    page.evaluate(async () => ({
      name: (window as any)._artbotDb.name,
      images: await (window as any)._artbotDb.completed.count(),
      verified: localStorage.getItem('ArtBotLibrarySelection:lastVerified')
    }))
  const before = await current()
  await chooseVerificationFiles(page, unavailable)
  await expect(
    page.getByRole('status', { name: 'Backup status' })
  ).toContainText('empty or unavailable')
  await expect(
    page.getByRole('status', { name: 'Backup status' })
  ).toContainText('Choose the saved files again')
  expect(await current()).toEqual(before)
  await chooseRestoreFiles(page, unavailable)
  await expect(
    page.getByRole('status', { name: 'Restore status' })
  ).toContainText('empty or unavailable')
  await expect(
    page.getByRole('button', { name: 'Restore library', exact: true })
  ).toBeDisabled()
  expect(await current()).toEqual(before)
  await chooseVerificationFiles(page, files)
  await expect(
    page.getByRole('status', { name: 'Backup status' })
  ).toContainText('Saved backup verified:')
  expect((await current()).verified).not.toBe(before.verified)
  const [reselection] = await Promise.all([
    page.waitForEvent('filechooser'),
    page
      .getByRole('button', { name: 'Choose backup files again', exact: true })
      .click()
  ])
  await reselection.setFiles(files)
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Restore status' })
  ).toContainText('ArtBot database imported!')
  expect((await current()).name).not.toBe(before.name)
  // Keep the post-rollback document uninitialized briefly, as on a slower
  // hosted runner. Audits must wait for the new database connection.
  await page.route('**/_next/static/chunks/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    await route.continue()
  })
  await page
    .getByRole('button', { name: 'Return to previous library', exact: true })
    .click()
  await page.waitForFunction((name) => {
    const database = (window as any)._artbotDb
    return database?.name === name && database.isOpen()
  }, before.name)
  expect((await current()).name).toBe(before.name)
  expect((await current()).images).toBe(before.images)
})

test('preparing a backup disables competing restore and image-download actions', async ({
  page
}) => {
  await openLibrary(page)
  await page.evaluate(() => {
    const original = crypto.subtle.digest.bind(crypto.subtle)
    const held = new Promise<void>((resolve) => {
      ;(window as any).__releaseBackupDigest = resolve
    })
    crypto.subtle.digest = async (
      ...args: Parameters<SubtleCrypto['digest']>
    ) => {
      await held
      return original(...args)
    }
  })
  try {
    await page
      .getByRole('button', { name: 'Prepare backup', exact: true })
      .click()
    await expect(
      page.getByRole('status', { name: 'Current backup operation' })
    ).toContainText('Preparing backup')
    await expect(
      page.getByLabel('Choose backup files', { exact: true })
    ).toBeDisabled()
    await page.getByText('Download images', { exact: true }).click()
    await expect(
      page.getByRole('button', { name: /^Download images \(/ }).first()
    ).toBeDisabled()
  } finally {
    await page.evaluate(() => (window as any).__releaseBackupDigest())
  }
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible({ timeout: 90000 })
})

test('image ZIP includes the first and last images in the displayed range', async ({
  page
}, info) => {
  await openLibrary(page)
  const image = (await createTestImage('png')).toString('base64')
  await page.evaluate(async (image) => {
    const table = (window as any)._artbotDb.completed
    await table.clear()
    await table.bulkAdd(
      ['first', 'middle', 'last'].map((prompt, index) => ({
        jobId: prompt,
        prompt,
        timestamp: index + 1,
        base64String: image
      }))
    )
  }, image)
  await page.reload()
  await page.getByText('Download images', { exact: true }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('Download images (1 - 3)', { exact: true }).click()
  ])
  const file = info.outputPath(download.suggestedFilename())
  await download.saveAs(file)
  const bytes = readFileSync(file)
  const names: string[] = []
  const signature = Buffer.from([0x50, 0x4b, 0x01, 0x02])
  let offset = bytes.indexOf(signature)
  while (offset !== -1 && bytes.readUInt32LE(offset) === 0x02014b50) {
    const length = bytes.readUInt16LE(offset + 28)
    names.push(bytes.subarray(offset + 46, offset + 46 + length).toString())
    offset +=
      46 +
      length +
      bytes.readUInt16LE(offset + 30) +
      bytes.readUInt16LE(offset + 32)
    if (offset + 4 > bytes.length) break
  }
  expect(names).toHaveLength(4)
  expect(names.some((name) => name.includes('first'))).toBe(true)
  expect(names.some((name) => name.includes('last'))).toBe(true)
})

test('backup page does not prefetch unrelated footer routes', async ({
  page
}) => {
  const requests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (
      /\/(about|contributors|changelog)$/.test(url.pathname) &&
      url.searchParams.has('_rsc')
    )
      requests.push(url.pathname)
  })
  await openLibrary(page)
  await page
    .getByRole('link', { name: 'Changelog', exact: true })
    .last()
    .hover()
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
  expect(requests).toEqual([])
})

test('folder export streams a complete saved set sequentially without claiming verification', async ({
  page
}) => {
  test.setTimeout(120000)
  await page.addInitScript(() => {
    const state = { active: 0, maxActive: 0, files: [] as any[] }
    ;(window as any).__folderResult = state
    ;(window as any).showDirectoryPicker = async () => ({
      getFileHandle: async (name: string) => ({
        createWritable: async () => {
          state.active++
          state.maxActive = Math.max(state.maxActive, state.active)
          const chunks: Uint8Array<ArrayBuffer>[] = []
          return new WritableStream({
            write(chunk) {
              chunks.push(chunk)
            },
            async close() {
              const blob = new Blob(chunks)
              const bytes = await blob.arrayBuffer()
              const sha = Array.from(
                new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
                (byte) => byte.toString(16).padStart(2, '0')
              ).join('')
              state.files.push({
                name,
                size: blob.size,
                sha,
                manifest: name.endsWith('.manifest.json')
                  ? JSON.parse(await blob.text())
                  : null
              })
              state.active--
            }
          })
        }
      })
    })
  })
  await openLibrary(page, 7 * 1048576)
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible({ timeout: 90000 })
  await page
    .getByRole('button', { name: 'Save all to a folder', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Backup status' })
  ).toContainText('Files written to the selected folder.')
  const result = await page.evaluate(() => (window as any).__folderResult)
  expect(result.maxActive).toBe(1)
  expect(result.active).toBe(0)
  const manifest = result.files.find((file: any) => file.manifest).manifest
  expect(result.files).toHaveLength(manifest.parts.length + 1)
  for (const part of manifest.parts) {
    const saved = result.files.find((file: any) => file.name === part.name)
    expect(saved.size).toBe(part.size)
    expect(saved.sha).toBe(part.sha256)
  }
  expect(
    await page.evaluate(() =>
      localStorage.getItem('ArtBotLibrarySelection:lastVerified')
    )
  ).toBeNull()
  await expect(
    page.getByRole('status', { name: 'Saved-file verification progress' })
  ).toContainText('0 of')
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})

test('cancelled native sharing keeps the same file as the next save action', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Cancelled', 'AbortError')
      }
    })
  })
  await openLibrary(page)
  await page
    .getByRole('button', { name: 'Prepare backup', exact: true })
    .click()
  await expect(
    page.getByText('Prepared locally.', { exact: false })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Share/save manifest', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Backup status' })
  ).toContainText('Share cancelled')
  await expect(
    page.getByRole('region', { name: 'Backup file checklist' })
  ).toContainText('Next: select and save manifest.')
  await expect(
    page.getByRole('status', { name: 'Saved-file verification progress' })
  ).toContainText('0 of')
})

test('direct ZIP output streams images sequentially, reports skips, and can be cancelled', async ({
  page
}) => {
  await page.addInitScript(() => {
    ;(window as any).__zipReceipts = []
    ;(window as any).showSaveFilePicker = async () => ({
      createWritable: async () => {
        const receipt = { bytes: 0, closed: false, aborted: false }
        ;(window as any).__zipReceipts.push(receipt)
        return new WritableStream({
          async write(chunk) {
            receipt.bytes += chunk.byteLength
            if ((window as any).__slowZip)
              await new Promise((resolve) => setTimeout(resolve, 200))
          },
          close() {
            receipt.closed = true
          },
          abort() {
            receipt.aborted = true
          }
        })
      }
    })
  })
  await openLibrary(page)
  const image = (await createTestImage('png')).toString('base64')
  await page.evaluate(async (image) => {
    const table = (window as any)._artbotDb.completed
    await table.clear()
    await table.bulkAdd([
      { jobId: 'first', prompt: 'first', timestamp: 1, base64String: image },
      { jobId: 'missing', prompt: 'missing', timestamp: 2 },
      { jobId: 'last', prompt: 'last', timestamp: 3, base64String: image }
    ])
  }, image)
  // Reload to refresh the visible count, then observe the real table at its API boundary.
  await page.reload()
  await page.waitForFunction(() => (window as any)._artbotDb?.isOpen())
  await page.evaluate(() => {
    ;(window as any).__zipReads = []
    const table = (window as any)._artbotDb.completed
    const get = table.get.bind(table)
    table.get = async (...args: any[]) => {
      const row = await get(...args)
      ;(window as any).__zipReads.push(row.jobId)
      return row
    }
    table.toArray = () => {
      throw new Error('ZIP must not materialize the image table')
    }
  })
  await page.getByText('Download images', { exact: true }).click()
  await page
    .getByRole('button', { name: 'Save ZIP directly (1 - 3)', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Image download status' })
  ).toContainText('2 images included; 1 skipped')
  expect(await page.evaluate(() => (window as any).__zipReads)).toEqual([
    'first',
    'missing',
    'last'
  ])
  expect(
    await page.evaluate(() => (window as any).__zipReceipts[0])
  ).toMatchObject({ closed: true, aborted: false })
  await page.evaluate(() => {
    ;(window as any).__slowZip = true
  })
  await page
    .getByRole('button', { name: 'Save ZIP directly (1 - 3)', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Cancel image ZIP', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Image download status' })
  ).toContainText('cancelled')
  await expect(
    page.getByRole('button', { name: 'Prepare backup', exact: true })
  ).toBeEnabled()
  expect(
    await page.evaluate(() => (window as any).__zipReceipts[1])
  ).toMatchObject({ closed: false, aborted: true })
})

const frozenFiles = () => {
  const fixture = JSON.parse(
    readFileSync(path.join(__dirname, 'fixtures/backup-v1.json'), 'utf8')
  )
  return fixture.files.map((file: any) => ({
    name: file.name,
    mimeType: 'application/octet-stream',
    buffer: Buffer.from(file.base64, 'base64')
  }))
}

test('restore preview and activation credit a committed checkpoint when only remaining storage fits', async ({
  page
}) => {
  await openLibrary(page)
  const files = frozenFiles()
  await chooseRestoreFiles(page, files)
  await page.evaluate(() => {
    const set = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ArtBotLibrarySelection') {
        Storage.prototype.setItem = set
        throw new DOMException(
          'Simulated selection quota',
          'QuotaExceededError'
        )
      }
      return set.call(this, key, value)
    }
  })
  await page
    .getByRole('button', { name: 'Restore library', exact: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Restore status' })
  ).toContainText('Unable to import')
  expect(await page.evaluate(() => (window as any)._artbotDb.name)).toBe(
    'imageHorde'
  )
  await page.evaluate(
    async (total) => {
      const request = <T>(request: IDBRequest<T>) =>
        new Promise<T>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
      const database = await request(indexedDB.open('ArtBotBackupCatalog'))
      const attempts: any[] = await request(
        database.transaction('restores').objectStore('restores').getAll()
      )
      database.close()
      const attempt = attempts.find((attempt) => attempt.status === 'verified')
      if (!attempt?.stagedBytes) throw new Error('No committed checkpoint')
      const usage = 1024 * 1024 * 1024
      const available =
        32 * 1024 * 1024 + 1.5 * (total - attempt.stagedBytes / 2)
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        value: {
          estimate: async () => ({ usage, quota: usage + available }),
          persisted: async () => false
        }
      })
    },
    files.reduce((bytes: number, file: any) => bytes + file.buffer.length, 0)
  )
  await page
    .getByText('Unfinished restores and cleanup', { exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Choose files to resume', exact: true })
    .click()
  await chooseRestoreFiles(page, files)
  const preview = page.getByRole('region', { name: 'Restore preview' })
  await expect(preview).toContainText('Already staged')
  await expect(preview).not.toContainText('Not enough estimated storage')
  await page
    .getByRole('button', { name: 'Resume restore', exact: true })
    .click()
  await page.waitForFunction(() => {
    const database = (window as any)._artbotDb
    return database?.isOpen() && database.name !== 'imageHorde'
  })
  await page
    .getByRole('button', { name: 'Return to previous library', exact: true })
    .click()
  await page.waitForFunction(
    () =>
      (window as any)._artbotDb?.isOpen() &&
      (window as any)._artbotDb.name === 'imageHorde'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})

test('retained-library cleanup confirms deletion and preserves the active library and its recovery chain', async ({
  page
}) => {
  await openLibrary(page)
  for (let index = 0; index < 2; index++) {
    const before = await page.evaluate(() => (window as any)._artbotDb.name)
    await chooseRestoreFiles(page, frozenFiles())
    await page
      .getByRole('button', { name: 'Restore library', exact: true })
      .click()
    await page.waitForFunction((name) => {
      const database = (window as any)._artbotDb
      return database?.isOpen() && database.name !== name
    }, before)
  }
  for (let index = 0; index < 2; index++) {
    const before = await page.evaluate(() => (window as any)._artbotDb.name)
    await page
      .getByRole('button', { name: 'Return to previous library', exact: true })
      .click()
    await page.waitForFunction((name) => {
      const database = (window as any)._artbotDb
      return database?.isOpen() && database.name !== name
    }, before)
  }
  await page.getByText('Retained libraries (2)', { exact: true }).click()
  await expect(
    page.getByRole('button', {
      name: 'Delete retained library',
      disabled: true
    })
  ).toHaveCount(1)
  const removable = page.getByRole('button', {
    name: 'Delete retained library',
    disabled: false
  })
  await expect(removable).toHaveCount(1)
  page.once('dialog', (dialog) => dialog.dismiss())
  await removable.click()
  await expect(
    page.getByText('Retained libraries (2)', { exact: true })
  ).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await removable.click()
  await expect(
    page.getByText('Retained libraries (1)', { exact: true })
  ).toBeVisible()
  expect(await page.evaluate(() => (window as any)._artbotDb.name)).toBe(
    'imageHorde'
  )
  expect(
    await page.evaluate(() => (window as any)._artbotDb.completed.count())
  ).toBe(1)
})

test('a failed gallery ZIP closes its progress dialog and preserves the selection for retry', async ({
  page
}) => {
  await openLibrary(page)
  const image = (await createTestImage('png')).toString('base64')
  await page.evaluate(async (image) => {
    const table = (window as any)._artbotDb.completed
    await table.clear()
    await table.bulkAdd(
      [1, 2].map((index) => ({
        jobId: `zip-gallery-${index}`,
        prompt: `ZIP gallery ${index}`,
        timestamp: index,
        width: 64,
        height: 64,
        base64String: image,
        thumbnail: image
      }))
    )
  }, image)
  await page.goto('/artbot/images')
  await expect(page.locator('a[href^="/artbot/image/"]')).toHaveCount(2)
  await page.getByTitle('Select Images', { exact: true }).click()
  await page.getByText('[ select all ]', { exact: true }).click()
  await expect(page.getByText('selected (2)', { exact: true })).toBeVisible()
  await page.evaluate(() => {
    const fetch = window.fetch.bind(window)
    window.fetch = (input, init) =>
      String(input).startsWith('data:')
        ? Promise.reject(new Error('Synthetic unreadable image bytes'))
        : fetch(input, init)
  })
  await page.getByText('[ download ]', { exact: true }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Unable to download images.' })
  ).toBeVisible()
  await expect(
    page.getByText('Downloading images', { exact: true })
  ).toHaveCount(0)
  await expect(page.getByText('selected (2)', { exact: true })).toBeVisible()
})
