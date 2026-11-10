import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises'
import { chromium, expect } from '@playwright/test'
import {
  assertClosed,
  assertCompatible,
  treeHash
} from '../browser-profile/storage.mjs'
import {
  startReplayNetwork,
  openProbe,
  ORIGIN
} from '../browser-profile/network.mjs'
import { auditStorage } from '../browser-profile/audit.mjs'
import { createHorde } from './horde.mjs'

const repo = fileURLToPath(new URL('../../', import.meta.url))
if (!process.argv[2])
  throw new Error(
    'Pass the comparison report whose candidate completed the ten-image batch'
  )
const sourceReport = JSON.parse(
  await readFile(path.resolve(process.argv[2]), 'utf8')
)
const source = sourceReport.lanes.candidate
assert.equal(
  source.status,
  'passed',
  'Candidate comparison must pass before rollback'
)
assert.equal(
  source.batch.rows.length,
  10,
  'Expected ten newly generated images'
)
const profile = path.resolve(source.profile, 'profile')
assert.ok(
  profile.startsWith(path.join(repo, '__local_db/browser-profiles/runs/')),
  'Only managed test profiles can be used'
)
const manifest = JSON.parse(
  await readFile(path.join(source.profile, 'source.json'), 'utf8')
)
await assertCompatible(manifest)
await assertClosed(profile)
process.umask(0o077)
const out = path.join(
  repo,
  '__local_db/upgrade-comparison/results',
  `rollback-${new Date().toISOString().replace(/[:.]/g, '-')}`
)
await mkdir(out, { recursive: true })
const sourceHash = await treeHash(profile)
await cp(profile, path.join(out, 'profile'), { recursive: true })
const net = await startReplayNetwork({
  certDir: path.join(repo, '__local_db/browser-profiles/tls'),
  target: 'http://127.0.0.1:3297'
})
let context
const result = {
  sourceReport: path.resolve(process.argv[2]),
  sourceProfileSha256: sourceHash,
  target: 'control on port 3297'
}
try {
  context = await chromium.launchPersistentContext(path.join(out, 'profile'), {
    channel: 'chromium',
    headless: true,
    ...net.launchOptions
  })
  await createHorde().install(context)
  let page = await openProbe(context, net)
  const before = await auditStorage(page, { recordDigests: true })
  await page.goto(`${ORIGIN}/artbot/image/comparison-job-10`)
  await expect
    .poll(
      () =>
        page
          .getByAltText('a cat wearing sunglasses, regression comparison')
          .first()
          .evaluate((i) => i.naturalWidth),
      { timeout: 15000 }
    )
    .toBeGreaterThan(0)
  await page.goto(`${ORIGIN}/artbot/images`)
  await expect(page.locator('a[href*="/artbot/image/"]').first()).toBeVisible()
  await page.close()
  page = await openProbe(context, net)
  const after = await auditStorage(page, { recordDigests: true })
  assert.deepEqual(
    after.databases.map((d) => [d.name, d.version]),
    before.databases.map((d) => [d.name, d.version])
  )
  const store = (a) =>
    a.databases
      .find((d) => d.name === 'imageHorde')
      .stores.find((s) => s.name === 'completed')
  const expectedCount = (source.initialCompleted ?? 43) + 10
  assert.equal(store(before).rows, expectedCount)
  assert.equal(
    store(after).sha256,
    store(before).sha256,
    'Rollback changed saved image bytes'
  )
  result.completed = expectedCount
  result.status = 'passed'
  await writeFile(
    path.join(out, 'before.json'),
    JSON.stringify(before, null, 2)
  )
  await writeFile(path.join(out, 'after.json'), JSON.stringify(after, null, 2))
} catch (e) {
  result.status = 'failed'
  result.failure = e.stack
} finally {
  await context?.close()
  await net.close()
  assert.equal(
    await treeHash(profile),
    sourceHash,
    'Rollback changed source candidate profile'
  )
  await writeFile(
    path.join(out, 'report.json'),
    JSON.stringify(result, null, 2)
  )
}
console.log(`Rollback ${result.status}. Report: ${out}/report.json`)
if (result.status !== 'passed') process.exitCode = 1
