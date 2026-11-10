import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium, expect } from '@playwright/test'
import {
  cloneBaseline,
  treeHash,
  waitForProfileExit
} from '../browser-profile/storage.mjs'
import {
  startReplayNetwork,
  openProbe,
  ORIGIN
} from '../browser-profile/network.mjs'
import { auditStorage } from '../browser-profile/audit.mjs'
import { createHorde } from './horde.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values } = parseArgs({
  options: {
    control: { type: 'string', default: 'http://127.0.0.1:3297' },
    candidate: { type: 'string', default: 'http://127.0.0.1:3298' },
    baseline: { type: 'string', default: 'manual-workflows' },
    'expected-images': { type: 'string', default: '43' },
    'no-op-only': { type: 'boolean', default: false },
    'batch-only': { type: 'boolean', default: false },
    'reload-only': { type: 'boolean', default: false },
    lane: { type: 'string', default: 'all' }
  }
})
process.umask(0o077)
const initialCount = Number(values['expected-images'])
assert.ok(
  Number.isSafeInteger(initialCount) && initialCount >= 0,
  'Invalid expected image count'
)
assert.ok(['all', 'control', 'candidate'].includes(values.lane), 'Invalid lane')
const root = path.join(repo, '__local_db/browser-profiles')
const directory = path.join(
  repo,
  '__local_db/upgrade-comparison/results',
  new Date().toISOString().replace(/[:.]/g, '-')
)
await mkdir(directory, { recursive: true })
const report = {
  started: new Date().toISOString(),
  baseline: values.baseline,
  runtime: process.version,
  lanes: {},
  comparisons: {}
}
const save = async () =>
  writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(report, null, 2)
  )
const stores = (audit) =>
  new Map(
    audit.databases.flatMap((db) =>
      db.stores.map((s) => [`${db.name}/${s.name}`, s])
    )
  )
function preserves(before, after, except = []) {
  const actual = stores(after)
  for (const [name, store] of stores(before)) {
    assert.ok(actual.has(name), `Missing store ${name}`)
    if (except.includes(store.name)) continue
    for (const record of store.recordDigests) {
      assert.deepEqual(
        actual
          .get(name)
          .recordDigests.find((r) => r.keySha256 === record.keySha256),
        record,
        `Changed or lost original record in ${name}`
      )
    }
  }
}
function exact(before, after, except = []) {
  assert.deepEqual(
    after.databases.map((d) => [d.name, d.version]),
    before.databases.map((d) => [d.name, d.version]),
    'Database versions changed'
  )
  for (const [name, store] of stores(before)) {
    const current = stores(after).get(name)
    assert.ok(current, `Missing store ${name}`)
    assert.deepEqual(
      [current.keyPath, current.autoIncrement, current.indexes],
      [store.keyPath, store.autoIncrement, store.indexes],
      `Schema changed in ${name}`
    )
    if (!except.includes(store.name))
      assert.equal(
        current.sha256,
        store.sha256,
        `Stored bytes changed in ${name}`
      )
  }
}
function settingsUnchanged(before, after) {
  // Election heartbeats and last-visit timestamps change on every launch.
  const volatile = new Set(['ArtBotLastActive', 'PrimaryWindow', 'ping', 'new'])
  const stable = (audit) =>
    audit.localStorage.entries.filter((e) => !volatile.has(e.key))
  assert.deepEqual(
    stable(after),
    stable(before),
    'Persistent localStorage settings changed'
  )
}
const completed = (audit) => stores(audit).get('imageHorde/completed')
async function ready(page, route = 'images') {
  const response = await page.goto(`${ORIGIN}/artbot/${route}`, {
    waitUntil: 'domcontentloaded'
  })
  assert.ok(response.status() < 400, `App returned ${response.status()}`)
  await page.waitForFunction(() => Boolean(window._artbotDb?.completed), null, {
    timeout: 30000
  })
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('An unexpected error has occurred')).toHaveCount(
    0
  )
}
async function audit(context, network, filename) {
  const probe = await openProbe(context, network)
  const result = await auditStorage(probe, { recordDigests: true })
  await probe.close()
  await writeFile(
    path.join(directory, filename),
    JSON.stringify(result, null, 2)
  )
  return result
}
async function launch(profile, network, backend, errors) {
  await waitForProfileExit(profile)
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    ...network.launchOptions
  })
  await backend.install(context)
  context.on('page', (page) =>
    page.on('pageerror', (error) => errors.push(error.message))
  )
  for (const page of context.pages()) await page.close()
  return context
}
async function lane(name, target) {
  const run = await cloneBaseline(root, values.baseline)
  const backend = createHorde()
  const errors = []
  const result = (report.lanes[name] = {
    target,
    profile: run.directory,
    checks: [],
    errors
  })
  const network = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target
  })
  let context
  try {
    // A real Next production server must expose its build marker. The test never
    // starts/reuses a dev server; callers own two isolated production processes.
    const build = await fetch(`${target}/artbot/api/server-info`).then((r) =>
      r.json()
    )
    result.server = build
    context = await launch(run.profile, network, backend, errors)
    const before = await audit(context, network, `${name}-before.json`)
    result.baselineSha256 = run.manifest.profileSha256
    assert.equal(
      completed(before).rows,
      initialCount,
      'Unexpected initial image count'
    )
    result.initialCompleted = initialCount
    const pendingBefore = stores(before).get('imageHorde/pending')
    const oldErrorCount = (pendingBefore.workflows ?? [])
      .filter((w) => w.status === 'error')
      .reduce((sum, w) => sum + w.count, 0)
    assert.ok(
      (pendingBefore.workflows ?? []).every((w) =>
        ['done', 'error'].includes(w.status)
      ),
      'Start with a baseline that has no active requests'
    )
    for (let cycle = 1; cycle <= (values['batch-only'] ? 0 : 2); cycle++) {
      const page = await context.newPage()
      await ready(page)
      await expect(
        page.locator('a[href*="/artbot/image/"]').first()
      ).toBeVisible()
      await page.locator('a[href*="/artbot/image/"]').first().click()
      const image = page.locator('img').filter({ visible: true }).last()
      // Modal routes differ across releases; any visible decoded image proves
      // that the old library can render, while the full byte audit covers all43.
      await expect
        .poll(() => image.evaluate((img) => img.naturalWidth), {
          timeout: 10000
        })
        .toBeGreaterThan(0)
      await page.waitForTimeout(5500)
      await page.close()
      const after = await audit(
        context,
        network,
        `${name}-reopen-${cycle}.json`
      )
      exact(before, after, ['pending'])
      settingsUnchanged(before, after)
      preserves(before, after, ['pending'])
      const pending = stores(after).get('imageHorde/pending')
      assert.equal(
        pending.rows,
        oldErrorCount,
        'Only old done records should be cleaned'
      )
      assert.ok((pending.workflows ?? []).every((w) => w.status === 'error'))
      const oldPending = stores(before).get('imageHorde/pending')
      for (const record of pending.recordDigests)
        assert.deepEqual(
          record,
          oldPending.recordDigests.find(
            (r) => r.keySha256 === record.keySha256
          ),
          'An original error record changed'
        )
      result.checks.push(
        `reopen-${cycle}: all ${initialCount} images and non-pending stores byte-identical; ${oldErrorCount} old errors retained`
      )
      result.noOp = after
      await context.close()
      context = await launch(run.profile, network, backend, errors)
    }
    if (!values['no-op-only']) {
      const page = await context.newPage()
      await ready(page, 'create')
      // Make reset completion observable even if the saved prompt was empty.
      // Nothing is submitted until the real scenario prompt is filled below.
      await page
        .getByPlaceholder('Describe your image')
        .fill('profile lab reset marker')
      await expect(page.getByPlaceholder('Describe your image')).toHaveValue(
        'profile lab reset marker'
      )
      await page.getByTitle('Clear current input').first().click()
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Reset', exact: true })
        .click()
      // Reset reads the default prompt before replacing the entire form.
      await expect(page.getByPlaceholder('Describe your image')).toHaveValue('')
      await page
        .getByPlaceholder('Describe your image')
        .fill('a cat wearing sunglasses, regression comparison')
      // The range slider and text input share the same min/max attributes.
      await page.locator('input[max="200"]:not([type="range"])').fill('10')
      await expect(page.getByPlaceholder('Describe your image')).toHaveValue(
        'a cat wearing sunglasses, regression comparison'
      )
      await expect(
        page.locator('input[max="200"]:not([type="range"])')
      ).toHaveValue('10')
      await page.getByTitle('Create new image').first().click()
      await expect
        .poll(() => backend.submissions.length, { timeout: 45000 })
        .toBeGreaterThanOrEqual(3)
      console.log(
        `${name}: batch submitted; ${JSON.stringify(backend.summary())}`
      )
      await page.goto(`${ORIGIN}/artbot/pending`)
      await page.reload()
      await page.waitForFunction(() => Boolean(window._artbotDb?.pending))
      await expect
        .poll(() =>
          page.evaluate(
            async () =>
              (await window._artbotDb.pending.toArray()).filter(
                (r) =>
                  r.prompt === 'a cat wearing sunglasses, regression comparison'
              ).length
          )
        )
        .toBe(10)
      result.checks.push(
        'all ten requests retained through fast navigation and reload'
      )
      await save()
      if (values['reload-only']) {
        result.status = 'passed'
        return
      }
      // Drain the first half so the app's concurrency limit can admit the rest.
      // Interrupt polling after all POSTs are acknowledged; ambiguous POST
      // delivery needs an explicit retry scenario, not automatic resubmission.
      backend.releaseFirst(5)
      await expect
        .poll(() => backend.submissions.length, { timeout: 60000 })
        .toBe(10)
      backend.setOutage(true)
      await page.waitForTimeout(6500)
      await context.close()
      backend.setOutage(false)
      context = await launch(run.profile, network, backend, errors)
      const primary = await context.newPage()
      await ready(primary, 'pending')
      const second = await context.newPage()
      await ready(second, 'pending')
      await second.bringToFront()
      await primary.close()
      backend.release()
      console.log(
        `${name}: browser restarted and primary tab closed; releasing results`
      )
      await expect
        .poll(() => second.evaluate(() => window._artbotDb.completed.count()), {
          timeout: 150000,
          intervals: [1000]
        })
        .toBe(initialCount + 10)
      const rows = await second.evaluate(async () =>
        (await window._artbotDb.completed.toArray())
          .filter(
            (r) =>
              r.prompt === 'a cat wearing sunglasses, regression comparison'
          )
          .map((r) => ({
            jobId: r.jobId,
            parentJobId: r.parentJobId,
            numImages: r.numImages,
            seed: r.seed
          }))
      )
      assert.equal(rows.length, 10)
      assert.equal(new Set(rows.map((r) => r.jobId)).size, 10)
      assert.equal(new Set(rows.map((r) => r.parentJobId)).size, 1)
      assert.equal(
        backend.submissions.length,
        10,
        'Duplicate or missing Horde submissions'
      )
      assert.ok(
        backend.summary().maxActive <= 10,
        'Exceeded signed-in concurrency limit'
      )
      assert.ok(backend.submissions.every((s) => s.params.n === 1))
      const after = await audit(context, network, `${name}-batch.json`)
      preserves(before, after, ['pending', 'settings'])
      result.batch = { rows, ...backend.summary() }
      result.checks.push(
        'ten-image batch survives navigation, reload, API outage, browser restart, and primary-tab close; ten unique completions and submissions'
      )
    }
    assert.deepEqual(errors, [], 'Uncaught browser errors')
    assert.equal(network.stats.liveHorde, 0)
    result.status = 'passed'
  } catch (error) {
    result.status = 'failed'
    result.failure = error.stack
    result.diagnostics = await context
      ?.pages()
      .at(-1)
      ?.evaluate(async () => {
        const config = JSON.parse(localStorage.getItem('appConfig') || '{}')
        const db = window._artbotDb
        return {
          focused: document.hasFocus(),
          visible: document.visibilityState,
          pauseJobQueue: config.pauseJobQueue ?? false,
          runInBackground: config.runInBackground,
          jobs: db
            ? (await db.pending.toArray())
                .filter((r) => r.prompt?.includes('regression comparison'))
                .map((r) => ({
                  status: r.jobStatus,
                  jobId: r.jobId,
                  numImages: r.numImages
                }))
            : []
        }
      })
      .catch(() => null)
    for (const [index, page] of (context?.pages() ?? []).entries())
      await page
        .screenshot({
          path: path.join(directory, `${name}-failure-${index}.png`),
          fullPage: true
        })
        .catch(() => {})
  } finally {
    await context?.close()
    result.backend = backend.summary()
    result.network = network.stats
    await network.close()
    assert.equal(
      await treeHash(path.join(root, 'baselines', values.baseline, 'profile')),
      run.manifest.profileSha256,
      'Frozen baseline was modified'
    )
    await save()
  }
  console.log(
    `${name}: ${result.status}${result.failure ? `: ${result.failure.split('\n')[0]}` : ''}`
  )
}
for (const name of ['control', 'candidate'].filter(
  (name) => values.lane === 'all' || values.lane === name
))
  await lane(name, values[name])
if (report.lanes.control?.noOp && report.lanes.candidate?.noOp) {
  try {
    exact(report.lanes.control.noOp, report.lanes.candidate.noOp)
    report.comparisons.noOp = 'all IndexedDB stores identical across releases'
  } catch (e) {
    report.comparisons.noOp = e.message
  }
}
report.finished = new Date().toISOString()
await save()
console.log(`Report: ${directory}/report.json`)
if (Object.values(report.lanes).some((lane) => lane.status !== 'passed'))
  process.exitCode = 1
