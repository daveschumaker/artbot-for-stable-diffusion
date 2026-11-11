import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium, expect } from '@playwright/test'
import { cloneBaseline, treeHash } from '../browser-profile/storage.mjs'
import { auditStorage } from '../browser-profile/audit.mjs'
import {
  startReplayNetwork,
  openProbe,
  ORIGIN
} from '../browser-profile/network.mjs'
import { createHorde } from './horde.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
const { values } = parseArgs({
  options: {
    baseline: { type: 'string', default: 'production-pagination-favorites' },
    control: { type: 'string', default: 'http://127.0.0.1:3297' },
    candidate: { type: 'string', default: 'http://127.0.0.1:3298' }
  }
})
process.umask(0o077)
const resultsRoot = path.join(repo, '__local_db/upgrade-comparison/results')
await mkdir(resultsRoot, { recursive: true })
const out = await mkdtemp(path.join(resultsRoot, 'gallery-'))
const root = path.join(repo, '__local_db/browser-profiles')
const result = { baseline: values.baseline, lanes: {} }
for (const [name, target] of [
  ['control', values.control],
  ['candidate', values.candidate]
]) {
  const run = await cloneBaseline(root, values.baseline)
  const network = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target
  })
  const lane = (result.lanes[name] = { target, pages: {}, status: 'running' })
  let context
  try {
    context = await chromium.launchPersistentContext(run.profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 1440, height: 1000 },
      ...network.launchOptions
    })
    await createHorde().install(context)
    const probe = await openProbe(context, network)
    const before = await auditStorage(probe, { recordDigests: true })
    const rows = await probe.evaluate(async () => {
      const db = await new Promise((res, rej) => {
        const q = indexedDB.open('imageHorde')
        q.onsuccess = () => res(q.result)
        q.onerror = () => rej(q.error)
      })
      const rows = await new Promise((res, rej) => {
        const rows = []
        const q = db
          .transaction('completed')
          .objectStore('completed')
          .index('timestamp')
          .openCursor(null, 'prev')
        q.onerror = () => rej(q.error)
        q.onsuccess = () => {
          const cursor = q.result
          if (!cursor) return res(rows)
          rows.push({
            jobId: cursor.value.jobId,
            favorited: cursor.value.favorited === true
          })
          cursor.continue()
        }
      })
      db.close()
      return rows
    })
    await probe.close()
    assert.ok(rows.length > 100, 'Use a baseline spanning several pages')
    const page = await context.newPage()
    const expectRows = (expected) =>
      expect
        .poll(() =>
          page
            .locator('a[href^="/artbot/image/"]')
            .evaluateAll((es) =>
              es.map((e) => e.getAttribute('href').split('/').pop()).sort()
            )
        )
        .toEqual(expected.map((r) => r.jobId).sort())
    for (const filter of ['all', 'favorited', 'unfavorited']) {
      const expected = rows.filter(
        (r) =>
          filter === 'all' ||
          (filter === 'favorited' ? r.favorited : !r.favorited)
      )
      assert.ok(expected.length > 50, `Baseline needs multiple ${filter} pages`)
      await page.goto(
        `${ORIGIN}/artbot/images${filter === 'all' ? '' : '?filter=' + filter}`
      )
      const seen = []
      lane.pages[filter] = []
      for (
        let number = 1;
        number <= Math.ceil(expected.length / 50);
        number++
      ) {
        if (number > 1)
          await page
            .locator('ul[class*="PaginationWrapper"]')
            .first()
            .getByText(String(number), { exact: true })
            .click()
        const slice = expected.slice((number - 1) * 50, number * 50)
        await expectRows(slice)
        const ids = await page
          .locator('a[href^="/artbot/image/"]')
          .evaluateAll((es) =>
            es.map((e) => e.getAttribute('href').split('/').pop())
          )
        seen.push(...ids)
        lane.pages[filter].push(ids.length)
      }
      assert.equal(
        new Set(seen).size,
        expected.length,
        `${filter} duplicated or lost images`
      )
      await page.reload()
      await expectRows(
        expected.slice(Math.floor((expected.length - 1) / 50) * 50)
      )
    }
    await page.close()
    const afterProbe = await openProbe(context, network)
    const after = await auditStorage(afterProbe, { recordDigests: true })
    const completed = (a) =>
      a.databases
        .find((d) => d.name === 'imageHorde')
        .stores.find((s) => s.name === 'completed')
    assert.equal(
      completed(after).sha256,
      completed(before).sha256,
      'Gallery browsing changed stored images or favorites'
    )
    lane.completed = rows.length
    lane.favorites = rows.filter((r) => r.favorited).length
    lane.status = 'passed'
  } catch (e) {
    lane.status = 'failed'
    lane.failure = e.stack
  } finally {
    await context?.close()
    await network.close()
    assert.equal(
      await treeHash(path.join(root, 'baselines', values.baseline, 'profile')),
      run.manifest.profileSha256,
      'Sealed baseline changed'
    )
    await writeFile(
      path.join(out, 'report.json'),
      JSON.stringify(result, null, 2)
    )
  }
  console.log(`${name}: ${lane.status}; ${JSON.stringify(lane.pages)}`)
}
console.log(`Report: ${out}/report.json`)
if (Object.values(result.lanes).some((l) => l.status !== 'passed'))
  process.exitCode = 1
