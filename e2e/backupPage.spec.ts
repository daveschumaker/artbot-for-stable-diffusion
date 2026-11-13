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
