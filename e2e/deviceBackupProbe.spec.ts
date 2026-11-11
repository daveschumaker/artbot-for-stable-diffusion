import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, test as base } from '@playwright/test'
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
test('disposable device probe checks interruption, binary integrity and rollback through the public backup module', async ({
  page
}, info) => {
  test.setTimeout(180000)
  const bundle = info.outputPath('device-probe.js')
  execFileSync(process.execPath, [
    'scripts/backup/build-device-probe.mjs',
    bundle
  ])
  await page.route('**/__backup-probe', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Disposable backup probe</title>'
    })
  )
  await page.goto('/__backup-probe')
  await page.addScriptTag({ content: readFileSync(bundle, 'utf8') })
  await page.exposeFunction('reportBackupProbePhase', (phase: unknown) =>
    console.log('Disposable backup phase', phase)
  )
  await page.evaluate(() => {
    ;(window as any).ArtBotBackupProbe.onProgress = (
      window as any
    ).reportBackupProbePhase
  })
  const bytes = Number(process.env.PROBE_BYTES || 1048576)
  const result = await page.evaluate(async (bytes) => {
    const started = performance.now()
    const value = await (window as any).ArtBotBackupProbe.run(bytes)
    return { ...value, elapsedMs: performance.now() - started }
  }, bytes)
  console.log('Disposable backup engine measurement', {
    browser: info.project.name,
    bytes: bytes * 3,
    elapsedMs: result.elapsedMs
  })
  expect(result).toMatchObject({
    passed: true,
    records: 3,
    sourceBytes: bytes * 3
  })
  expect(
    await page.evaluate(
      async () =>
        (await indexedDB.databases()).filter(
          (d) =>
            d.name?.startsWith('artbot-device-probe-') ||
            d.name?.startsWith('artbot-restored-')
        ).length
    )
  ).toBe(0)
})

test('the disposable Files panel restores actual saved downloads and removes its test databases', async ({
  page
}, info) => {
  test.setTimeout(180000)
  const bundle = info.outputPath('device-probe.js')
  execFileSync(process.execPath, [
    'scripts/backup/build-device-probe.mjs',
    bundle
  ])
  await page.route('**/__backup-probe', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Disposable Files test</title>'
    })
  )
  await page.goto('/__backup-probe')
  await page.addScriptTag({ content: readFileSync(bundle, 'utf8') })
  const prepared = await page.evaluate(() =>
    (window as any).ArtBotBackupProbe.openFilesTest()
  )
  expect(prepared).toMatchObject({ ready: true, files: 4 })
  const panel = page.getByRole('dialog', {
      name: 'Disposable backup Files test'
    }),
    buttons = panel.getByRole('button', { name: /^Save (manifest|part)/ })
  const paths: string[] = []
  for (let i = 0; i < (await buttons.count()); i++) {
    const event = page.waitForEvent('download')
    await buttons.nth(i).click()
    const download = await event
    const saved = info.outputPath(download.suggestedFilename())
    await download.saveAs(saved)
    paths.push(saved)
    if (i === 0) {
      await page.reload()
      await page.addScriptTag({ content: readFileSync(bundle, 'utf8') })
      const recovered = await page.evaluate(() =>
        (window as any).ArtBotBackupProbe.openFilesTest()
      )
      expect(recovered).toMatchObject({
        ready: true,
        files: 4,
        resumed: true,
        backupId: prepared.backupId
      })
    }
  }
  await panel.getByLabel('Saved test backup files').setInputFiles(paths)
  await panel
    .getByRole('button', { name: 'Verify and restore saved copies' })
    .click()
  await expect(panel.getByRole('status')).toContainText(
    'Passed: saved copies verified',
    { timeout: 120000 }
  )
  expect(
    await page.evaluate(() => (window as any).ArtBotBackupProbe.filesResult)
  ).toMatchObject({ passed: true, records: 3, files: 4 })
  await panel.getByRole('button', { name: 'Close test panel' }).click()
  await expect(panel).toHaveCount(0)
  expect(
    await page.evaluate(
      async () =>
        (await indexedDB.databases()).filter(
          (d) =>
            d.name?.startsWith('artbot-device-probe-') ||
            d.name?.startsWith('artbot-restored-')
        ).length
    )
  ).toBe(0)
})
