// Writes e2e/fixtures/legacy-backup.json: a database backup made by the
// deployed site (Dexie 3.2.4 and dexie-export-import 4.0.7), so the tests can
// check that backups users already saved still restore.
//
// Run it against a server running the deployed build, for example the control
// server from docs/upgrade-regression.md:
//
//   node e2e/fixtures/makeLegacyBackup.mjs http://127.0.0.1:3297
//
// It uses a fresh browser profile and never changes the server.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const origin = process.argv[2]
if (!origin) throw new Error('Pass the deployed build URL')
const out = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'legacy-backup.json'
)

// A 1x1 PNG, standing in for each stored image.
const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg=='

const browser = await chromium.launch()
const context = await browser.newContext({ acceptDownloads: true })
const page = await context.newPage()
// Keep the page offline from the Horde and other services.
await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
  route.abort()
)
await page.goto(`${origin}/artbot/settings?panel=import-export`)
await page.waitForFunction(() => Boolean(window._artbotDb?.completed))

const counts = await page.evaluate(async (png) => {
  const db = window._artbotDb
  await db.open()
  const bytes = Uint8Array.from({ length: 4096 }, (_, i) => (i * 37) % 256)
  await db.completed.bulkPut([
    // The oldest records: one `model` string, no models or source_image.
    {
      id: 1,
      jobId: 'legacy-model-string',
      timestamp: 1665000000000,
      prompt: 'a lighthouse in fog ### blurry',
      model: 'stable_diffusion',
      sampler: 'k_euler_a',
      steps: 20,
      cfg_scale: 7,
      seed: '12345',
      width: 512,
      height: 512,
      base64String: png
    },
    {
      id: 2,
      jobId: 'favorite-with-loras',
      parentJobId: 'parent-a',
      timestamp: 1700000000000,
      prompt: 'a red fox in snow',
      negative: 'text',
      models: ['Deliberate'],
      sampler: 'k_dpmpp_2m',
      steps: 30,
      cfg_scale: 6.5,
      seed: '999',
      width: 1024,
      height: 768,
      karras: true,
      favorited: true,
      kudos: 12.5,
      hordeImageId: 'horde-image-id',
      loras: [{ name: '123', strength: 0.75 }],
      base64String: png,
      thumbnail: png
    },
    // Id 3 and 4 were deleted, so the backup has a gap.
    {
      id: 5,
      jobId: 'img2img-with-blob',
      parentJobId: 'parent-b',
      timestamp: 1710000000000,
      prompt: 'a watercolor harbor',
      models: ['Dreamshaper'],
      source_image: png,
      source_processing: 'img2img',
      denoising_strength: 0.6,
      width: 512,
      height: 512,
      base64String: png,
      payload: new Blob([bytes], { type: 'application/octet-stream' })
    }
  ])
  await db.pending.bulkPut([
    {
      id: 7,
      jobId: 'pending-waiting',
      parentJobId: 'parent-c',
      timestamp: 1720000000000,
      jobStatus: 'waiting',
      prompt: 'still waiting',
      models: ['Deliberate'],
      numImages: 1
    },
    {
      id: 8,
      jobId: 'pending-error',
      timestamp: 1720000001000,
      jobStatus: 'error',
      errorMessage: 'No available workers',
      prompt: 'failed job',
      models: ['Deliberate'],
      numImages: 1
    }
  ])
  await db.images.put({
    id: 3,
    jobId: 'favorite-with-loras',
    parentJobId: 'parent-a',
    imageType: 'image/webp',
    type: 'ab-test',
    hordeImageId: 'horde-image-id-2',
    base64String: png,
    timestamp: 1700000003000
  })
  await db.prompts.put({
    id: 4,
    timestamp: 1700000002000,
    promptType: 'prompt',
    prompt: 'a saved prompt'
  })
  await db.settings.put({
    id: 2,
    name: 'favoriteModels',
    value: { Deliberate: true }
  })
  await db.projects.put({ id: 1, name: 'My project', type: 'user' })
  await db.tags.put({ id: 1, name: 'landscape' })
  await db.imageProjects.put({ id: 1, projectId: 1, imageId: 2 })
  await db.imageTags.put({ id: 1, tagId: 1, imageId: 2 })
  return {
    dexie: window.Dexie?.semVer ?? db.constructor?.semVer,
    verno: db.verno,
    native: db.backendDB().version,
    tables: Object.fromEntries(
      await Promise.all(db.tables.map(async (t) => [t.name, await t.count()]))
    )
  }
}, PNG)
console.log(counts)

await page.reload()
const download = page.waitForEvent('download')
await page.getByRole('button', { name: 'Download database' }).click()
await (await download).saveAs(out)
await browser.close()
console.log(`Wrote ${out}`)
