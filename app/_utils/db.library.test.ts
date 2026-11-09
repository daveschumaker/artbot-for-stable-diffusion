/**
 * Runs the query layer against rows saved by the real app from real AI Horde
 * jobs (e2e/fixtures/library.json), rather than rows written by hand.
 */
import 'fake-indexeddb/auto'
import { db, MySubClassedDexie } from 'app/_db/dexie'
import {
  _getImageDetails,
  countFilterCompleted,
  fetchRelatedImages,
  filterCompletedJobs
} from './db'

const library = require('e2e/fixtures/library.json')
const realImages: any[] = library.completed

const fixtureNames = (rows: any[] = []) =>
  rows.map((row) => row.fixtureName).sort()

const namesMatching = (test: (name: string) => boolean) =>
  realImages
    .map((row) => row.fixtureName)
    .filter(test)
    .sort()

const rowsWithSource = (sourceProcessing: string) =>
  realImages.filter((row) => row.source_processing === sourceProcessing)

const filtered = (filterType: string, model = '') =>
  filterCompletedJobs({ filterType, model, limit: 1000 })

beforeAll(async () => {
  await db.completed.bulkAdd(realImages)
})

afterAll(() => {
  db.close()
})

it('stores every real row unchanged', async () => {
  for (const image of realImages) {
    const stored = await _getImageDetails(image.jobId)
    expect(stored).toEqual({ ...image, id: expect.any(Number) })
  }
})

it('upgrades older rows when read, without rewriting them', async () => {
  const [older] = library.legacy
  await db.completed.add(older)

  try {
    const stored = await _getImageDetails(older.jobId)
    expect(stored.models).toEqual([older.model])
    expect(stored.source_image).toBe('')

    const raw = new MySubClassedDexie()
    const onDisk = await raw.table('completed').get({ jobId: older.jobId })
    raw.close()
    expect(onDisk.models).toBeUndefined()
    expect(onDisk.source_image).toBeUndefined()
  } finally {
    await db.completed.where('jobId').equals(older.jobId).delete()
  }
})

it('finds favorites', async () => {
  expect(fixtureNames(await filtered('favorited'))).toEqual(
    fixtureNames(realImages.filter((row) => row.favorited))
  )
})

it('counts unfavorited images', async () => {
  expect(await countFilterCompleted({ filterType: 'unfavorited' })).toBe(
    realImages.filter((row) => !row.favorited).length
  )
})

it('finds upscaled images', async () => {
  expect(fixtureNames(await filtered('upscaled'))).toEqual(['upscaled'])
})

it('finds inpainted images', async () => {
  expect(fixtureNames(await filtered('inpainting'))).toEqual(
    fixtureNames(rowsWithSource('inpainting'))
  )
})

it('finds img2img images', async () => {
  expect(fixtureNames(await filtered('img2img'))).toEqual(
    fixtureNames(rowsWithSource('img2img'))
  )
})

it('leaves img2img and inpainting out of text2img', async () => {
  expect(fixtureNames(await filtered('text2img'))).toEqual(
    fixtureNames(rowsWithSource('prompt'))
  )
})

it('finds images by model', async () => {
  expect(fixtureNames(await filtered('model', 'Dreamshaper'))).toEqual([
    'model-dreamshaper'
  ])
})

it('groups a batch by its parent job', async () => {
  const [{ parentJobId }] = realImages.filter(
    (row) => row.fixtureName === 'batch-1'
  )

  expect(fixtureNames(await fetchRelatedImages(parentJobId))).toEqual(
    namesMatching((name) => name.startsWith('batch-'))
  )
})
