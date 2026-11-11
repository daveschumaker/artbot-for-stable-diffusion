/**
 * Exercises the query layer against a real IndexedDB implementation.
 */
import 'fake-indexeddb/auto'
import { JobStatus } from '_types'
import { db } from 'app/_db/dexie'
import { SourceProcessing } from './promptUtils'
import {
  _allCompletedJobs,
  _getImageDetails,
  addCompletedJobToDexie,
  addImageToDexie,
  addPendingJobToDexie,
  allPendingJobs,
  bulkDeleteImages,
  claimPendingJobForSubmission,
  countCompletedJobs,
  countFilterCompleted,
  deleteAllPendingErrors,
  deleteAllPendingJobs,
  deleteCompletedImage,
  deleteCompletedImageById,
  deleteDoneFromPending,
  deleteImageFromDexie,
  deleteInvalidPendingJobs,
  deletePendingJobFromDb,
  deleteQueuedFromPending,
  deleteRequestedFromPending,
  deleteStalePending,
  fetchCompletedJobs,
  fetchCompletedJobsById,
  fetchFirstCompletedJob,
  fetchRelatedImages,
  filterCompletedByModel,
  filterCompletedJobs,
  getDefaultPrompt,
  getJobImagesFromDexie,
  getNextImageDetails,
  getParentJobDetails,
  getPendingJobDetails,
  getPrevImageDetails,
  getPrompts,
  imageCount,
  pendingCount,
  setDefaultPrompt,
  updateAllPendingJobs,
  updateCompletedJobByJobId
} from './db'

const completedRows = [
  {
    jobId: 'a',
    parentJobId: 'parent-1',
    timestamp: 100,
    model: 'legacy_model',
    favorited: true
  },
  {
    jobId: 'b',
    parentJobId: 'parent-1',
    timestamp: 200,
    models: ['Deliberate'],
    img2img: true,
    upscaled: true
  },
  {
    jobId: 'c',
    parentJobId: 'parent-2',
    timestamp: 300,
    models: ['Deliberate'],
    source_processing: SourceProcessing.InPainting,
    favorited: true
  },
  {
    jobId: 'd',
    timestamp: 400,
    models: ['Other'],
    source_processing: SourceProcessing.Prompt,
    favorited: false
  }
]

const jobIds = (rows: Array<{ jobId: string }> = []) =>
  rows.map((row) => row.jobId)

const seedCompleted = async () => {
  for (const row of completedRows) {
    await addCompletedJobToDexie(row)
  }
}

const seedPending = async (statuses: Array<JobStatus | undefined>) => {
  await db.pending.bulkAdd(
    statuses.map((jobStatus, index) => ({
      jobId: `job-${index}`,
      timestamp: index,
      jobStatus
    }))
  )
}

const remainingPendingStatuses = async () =>
  (await db.pending.toArray()).map((job: any) => job.jobStatus)

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()))
})

afterAll(() => {
  db.close()
})

describe('completed images', () => {
  beforeEach(seedCompleted)

  it('saves one completed record when two tabs finish the same job', async () => {
    await Promise.all([
      addCompletedJobToDexie({ jobId: 'shared-result', prompt: 'one result' }),
      addCompletedJobToDexie({ jobId: 'shared-result', prompt: 'one result' })
    ])
    expect(
      await db.completed.where('jobId').equals('shared-result').count()
    ).toBe(1)
  })

  it('counts and lists all images', async () => {
    expect(await countCompletedJobs()).toBe(4)
    expect(await imageCount()).toBe(4)
    expect(jobIds(await _allCompletedJobs())).toEqual(['a', 'b', 'c', 'd'])
  })

  it('finds the first image the user ever made', async () => {
    expect((await fetchFirstCompletedJob()).jobId).toBe('a')
  })

  it('pages newest first by default', async () => {
    expect(jobIds(await fetchCompletedJobs({ limit: 2 }))).toEqual(['d', 'c'])
    expect(jobIds(await fetchCompletedJobs({ limit: 2, offset: 2 }))).toEqual([
      'b',
      'a'
    ])
  })

  it('pages oldest first when asked', async () => {
    expect(jobIds(await fetchCompletedJobs({ limit: 3, sort: 'old' }))).toEqual(
      ['a', 'b', 'c']
    )
  })

  it('fetches a set of images by job id', async () => {
    const ids: any = ['a', 'd']
    expect(jobIds(await fetchCompletedJobsById(ids)).sort()).toEqual(ids)
  })

  it('returns related images in either direction', async () => {
    expect(jobIds(await fetchRelatedImages('parent-1', 10, 'normal'))).toEqual([
      'a',
      'b'
    ])
    expect(jobIds(await fetchRelatedImages('parent-1'))).toEqual(['b', 'a'])
  })

  it('treats a related image limit of 0 as unlimited', async () => {
    expect(await fetchRelatedImages('parent-1', 0)).toHaveLength(2)
  })

  it('gets parent details, or an empty object if there are none', async () => {
    expect((await getParentJobDetails('parent-2')).jobId).toBe('c')
    expect(await getParentJobDetails('missing')).toEqual({})
  })

  it('navigates between images by timestamp', async () => {
    expect((await getNextImageDetails(200)).jobId).toBe('c')
    expect((await getPrevImageDetails(200)).jobId).toBe('a')
    expect(await getNextImageDetails(400)).toBeUndefined()
  })

  it('updates a single image by job id', async () => {
    await updateCompletedJobByJobId('a', { favorited: false })
    expect((await _getImageDetails('a')).favorited).toBe(false)
    expect((await _getImageDetails('b')).favorited).toBeUndefined()
  })

  it('ignores an update with no job id', async () => {
    await updateCompletedJobByJobId('', { favorited: false })
    expect((await _getImageDetails('a')).favorited).toBe(true)
  })

  it('deletes by job id', async () => {
    await deleteCompletedImage('a')
    expect(jobIds(await _allCompletedJobs())).toEqual(['b', 'c', 'd'])
  })

  it('deletes by table id', async () => {
    const { id } = await _getImageDetails('b')
    await deleteCompletedImageById(id)
    expect(await _getImageDetails('b')).toBeUndefined()
  })

  it('bulk deletes by table id', async () => {
    const ids: any = [
      (await _getImageDetails('a')).id,
      (await _getImageDetails('c')).id
    ]
    await bulkDeleteImages(ids)
    expect(jobIds(await _allCompletedJobs())).toEqual(['b', 'd'])
  })
})

describe('gallery filters', () => {
  beforeEach(seedCompleted)

  it.each([
    ['favorited', ['a', 'c']],
    ['unfavorited', ['b', 'd']],
    ['img2img', ['b']],
    ['inpainting', ['c']],
    ['text2img', ['a', 'd']]
  ])('counts and lists %s images', async (filterType, expected) => {
    expect(await countFilterCompleted({ filterType })).toBe(expected.length)

    const rows = await filterCompletedJobs({ filterType, sort: 'old' })
    expect(jobIds(rows)).toEqual(expected)
  })

  it('lists upscaled images', async () => {
    expect(
      jobIds(await filterCompletedJobs({ filterType: 'upscaled' }))
    ).toEqual(['b'])
  })

  it.each([
    ['Deliberate', ['b', 'c']],
    ['legacy_model', ['a']],
    ['Nope', []]
  ])(
    'filters by model %s across both field shapes',
    async (model, expected) => {
      expect(await filterCompletedByModel(model)).toBe(expected.length)
      expect(await countFilterCompleted({ filterType: 'model', model })).toBe(
        expected.length
      )
      expect(
        jobIds(
          await filterCompletedJobs({ filterType: 'model', model, sort: 'old' })
        )
      ).toEqual(expected)
    }
  )

  it('pages filtered results newest first', async () => {
    const rows = await filterCompletedJobs({
      filterType: 'favorited',
      limit: 1,
      offset: 1
    })

    expect(jobIds(rows)).toEqual(['a'])
  })
})

describe('pending jobs', () => {
  it('lets only one tab claim a waiting job and rejects stale job ids', async () => {
    const id = await db.pending.add({
      jobId: 'shared-job',
      jobStatus: JobStatus.Waiting
    })
    expect(await claimPendingJobForSubmission(id, 'old-job')).toBeNull()
    const claims = await Promise.all([
      claimPendingJobForSubmission(id, 'shared-job'),
      claimPendingJobForSubmission(id, 'shared-job')
    ])
    expect(claims.filter(Boolean)).toHaveLength(1)
    expect((await db.pending.get(id)).jobStatus).toBe(JobStatus.Requested)
  })
  it('adds a new job without carrying over its table id', async () => {
    await addPendingJobToDexie({ id: 999, jobId: 'new' } as any)

    const stored = await getPendingJobDetails('new')
    expect(stored.id).not.toBe(999)
    expect(await pendingCount()).toBe(1)
  })

  it('replaces an existing job', async () => {
    const id = await addPendingJobToDexie({
      jobId: 'same',
      prompt: 'first'
    } as any)

    await addPendingJobToDexie({ id, jobId: 'same', prompt: 'second' } as any)

    expect(await pendingCount()).toBe(1)
    expect((await getPendingJobDetails('same')).prompt).toBe('second')
  })

  it('lists all jobs in insertion order', async () => {
    await seedPending([JobStatus.Waiting, JobStatus.Queued])
    expect(jobIds(await allPendingJobs())).toEqual(['job-0', 'job-1'])
  })

  it('filters jobs by status', async () => {
    await seedPending([JobStatus.Waiting, JobStatus.Queued])
    expect(jobIds(await allPendingJobs(JobStatus.Queued))).toEqual(['job-1'])
  })

  it.each([
    ['done', deleteDoneFromPending, JobStatus.Done],
    ['queued', deleteQueuedFromPending, JobStatus.Queued],
    ['requested', deleteRequestedFromPending, JobStatus.Requested]
  ])('deletes only %s jobs', async (_name, deleteJobs, status) => {
    await seedPending([status, JobStatus.Processing])

    await deleteJobs()

    expect(await remainingPendingStatuses()).toEqual([JobStatus.Processing])
  })

  it('deletes jobs that have no status', async () => {
    await seedPending([undefined, JobStatus.Queued])
    await deleteInvalidPendingJobs()
    expect(await remainingPendingStatuses()).toEqual([JobStatus.Queued])
  })

  it('removes stale jobs that have no status', async () => {
    await seedPending([undefined, JobStatus.Waiting])
    await deleteStalePending()
    expect(await remainingPendingStatuses()).toEqual([JobStatus.Waiting])
  })

  it('cancels queued and waiting jobs but leaves processing ones', async () => {
    await seedPending([
      JobStatus.Queued,
      JobStatus.Waiting,
      JobStatus.Processing
    ])

    await deleteAllPendingJobs()

    expect(await remainingPendingStatuses()).toEqual([JobStatus.Processing])
  })

  it('clears only errored jobs', async () => {
    await seedPending([JobStatus.Error, JobStatus.Waiting])
    await deleteAllPendingErrors()
    expect(await remainingPendingStatuses()).toEqual([JobStatus.Waiting])
  })

  it('deletes one job by job id', async () => {
    await seedPending([JobStatus.Waiting, JobStatus.Waiting])
    await deletePendingJobFromDb('job-0')
    expect(jobIds(await allPendingJobs())).toEqual(['job-1'])
  })

  it('applies a parent update only to waiting siblings', async () => {
    await db.pending.bulkAdd([
      { jobId: 'w', parentJobId: 'p', jobStatus: JobStatus.Waiting },
      { jobId: 'q', parentJobId: 'p', jobStatus: JobStatus.Queued },
      { jobId: 'x', parentJobId: 'other', jobStatus: JobStatus.Waiting }
    ])

    await updateAllPendingJobs('p', { errorMessage: 'nope' })

    expect((await getPendingJobDetails('w')).errorMessage).toBe('nope')
    expect((await getPendingJobDetails('q')).errorMessage).toBeUndefined()
    expect((await getPendingJobDetails('x')).errorMessage).toBeUndefined()
  })
})

describe('extra image storage', () => {
  it('stores, reads and deletes images for a job', async () => {
    await addImageToDexie({
      base64String: 'abc',
      hordeImageId: 'h1',
      jobId: 'job',
      type: 'ab-test'
    })

    const [image] = await getJobImagesFromDexie('job')
    expect(image).toMatchObject({
      base64String: 'abc',
      hordeImageId: 'h1',
      type: 'ab-test'
    })

    await deleteImageFromDexie('job')
    expect(await getJobImagesFromDexie('job')).toEqual([])
  })
})

describe('prompts', () => {
  it('creates a default prompt, then updates the same row', async () => {
    await setDefaultPrompt('first')
    await setDefaultPrompt('second')

    const defaults = await getDefaultPrompt()
    expect(defaults).toHaveLength(1)
    expect(defaults[0].prompt).toBe('second')
  })

  it('filters by one or two prompt types, newest first', async () => {
    await db.prompts.bulkAdd([
      { prompt: 'one', promptType: 'prompt', timestamp: 1 },
      { prompt: 'two', promptType: 'negative', timestamp: 2 },
      { prompt: 'three', promptType: 'other', timestamp: 3 }
    ])

    const single = await getPrompts('prompt')
    expect(single.map((row: any) => row.prompt)).toEqual(['one'])

    const both = await getPrompts('prompt', 'negative')
    expect(both.map((row: any) => row.prompt)).toEqual(['two', 'one'])
  })
})
