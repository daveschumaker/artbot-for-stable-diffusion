import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { chromium, expect } from '@playwright/test'
import sharp from 'sharp'
import { cloneBaseline, treeHash } from '../browser-profile/storage.mjs'
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
    candidate: { type: 'string', default: 'http://127.0.0.1:3298' }
  }
})
const root = path.join(repo, '__local_db/browser-profiles')
const out = path.join(
  repo,
  '__local_db/upgrade-comparison/results',
  `large-${new Date().toISOString().replace(/[:.]/g, '-')}`
)
process.umask(0o077)
await mkdir(out, { recursive: true })
const bytes = await sharp({
  create: { width: 512, height: 512, channels: 3, background: 'steelblue' }
})
  .webp()
  .toBuffer()
const results = {
  fixture: '43 frozen production records plus 957 synthetic 512px images',
  lanes: {}
}
for (const [name, target] of [
  ['control', values.control],
  ['candidate', values.candidate]
]) {
  const clone = await cloneBaseline(root, 'manual-workflows')
  const net = await startReplayNetwork({
    certDir: path.join(root, 'tls'),
    target
  })
  const result = (results.lanes[name] = { target, profile: clone.directory })
  let context
  try {
    context = await chromium.launchPersistentContext(clone.profile, {
      channel: 'chromium',
      headless: true,
      viewport: { width: 1440, height: 1000 },
      ...net.launchOptions
    })
    await createHorde().install(context)
    const p = await openProbe(context, net)
    const before = await auditStorage(p, { recordDigests: true })
    await p.evaluate(async (base64) => {
      const req = indexedDB.open('imageHorde')
      const db = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result)
        req.onerror = () => rej(req.error)
      })
      try {
        await new Promise((res, rej) => {
          const tx = db.transaction('completed', 'readwrite')
          const store = tx.objectStore('completed')
          for (let i = 1; i <= 957; i++)
            store.add({
              jobId: `scale-${i}`,
              parentJobId: `scale-${i}`,
              timestamp: Date.now() + i,
              prompt: `large library fixture ${i}`,
              models: ['Deliberate'],
              sampler: 'k_euler',
              steps: 20,
              cfg_scale: 7,
              seed: String(i),
              width: 512,
              height: 512,
              jobStatus: 'done',
              base64String: base64,
              thumbnail: base64,
              source_image: ''
            })
          tx.oncomplete = res
          tx.onerror = () => rej(tx.error)
        })
      } finally {
        db.close()
      }
    }, bytes.toString('base64'))
    const start = performance.now()
    await p.goto(`${ORIGIN}/artbot/images`)
    await expect(
      p
        .locator('strong')
        .filter({ hasText: /^1000$/ })
        .first()
    ).toBeVisible()
    const tile = p.locator('a[href="/artbot/image/scale-957"]').first()
    await expect(tile).toBeVisible()
    await expect
      .poll(() => tile.locator('img').evaluate((img) => img.naturalWidth))
      .toBe(512)
    result.galleryReadyMs = Math.round(performance.now() - start)
    await tile.click()
    await expect(
      p.getByAltText('large library fixture 957').first()
    ).toBeVisible()
    const detailStart = performance.now()
    await p.goto(`${ORIGIN}/artbot/image/scale-1`)
    await expect
      .poll(() =>
        p
          .getByAltText('large library fixture 1')
          .first()
          .evaluate((img) => img.naturalWidth)
      )
      .toBe(512)
    result.detailReadyMs = Math.round(performance.now() - detailStart)
    await p.close()
    const probe = await openProbe(context, net)
    const after = await auditStorage(probe, { recordDigests: true })
    const completed = (a) =>
      a.databases
        .find((d) => d.name === 'imageHorde')
        .stores.find((s) => s.name === 'completed')
    assert.equal(completed(after).rows, 1000)
    for (const record of completed(before).recordDigests)
      assert.deepEqual(
        completed(after).recordDigests.find(
          (r) => r.keySha256 === record.keySha256
        ),
        record,
        'Original image changed'
      )
    await writeFile(
      path.join(out, `${name}-audit.json`),
      JSON.stringify(after, null, 2)
    )
    result.status = 'passed'
  } catch (e) {
    result.status = 'failed'
    result.failure = e.stack
    for (const [i, p] of (context?.pages() ?? []).entries())
      await p
        .screenshot({
          path: path.join(out, `${name}-failure-${i}.png`),
          fullPage: true
        })
        .catch(() => {})
  } finally {
    await context?.close()
    await net.close()
    assert.equal(
      await treeHash(path.join(root, 'baselines/manual-workflows/profile')),
      clone.manifest.profileSha256
    )
    await writeFile(
      path.join(out, 'report.json'),
      JSON.stringify(results, null, 2)
    )
    console.log(name, result.status, result.failure?.split('\n')[0] ?? '')
  }
}
console.log(`Report: ${out}/report.json`)
if (Object.values(results.lanes).some((r) => r.status !== 'passed'))
  process.exitCode = 1
