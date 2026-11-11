/**
 * @jest-environment ./test-utils/jsdomWithIndexedDb.js
 *
 * Runs the real queue, polling and IndexedDB code against a fake AI Horde.
 * Only canvas/EXIF helpers (which need a real browser) and telemetry are mocked.
 */
import 'fake-indexeddb/auto'
import { JobStatus } from '_types'

const mockImages = { isValid: true }

jest.mock('app/_utils/analytics', () => ({
  trackNewSession: jest.fn(async () => {})
}))

jest.mock('app/_api/telemetry', () => ({
  trackEvent: jest.fn(),
  trackGaEvent: jest.fn()
}))

jest.mock('app/_utils/primaryWindow', () => ({
  pageHasFocus: () => true,
  pageIsPrimaryWindow: () => true,
  pageIsVisible: () => true
}))

jest.mock('app/_utils/blobUtils', () => ({
  initBlob: jest.fn(),
  blobToBase64: async () => 'data:image/webp;base64,STAMPED'
}))

const response = (status: number, body: any = {}) => ({
  status,
  ok: status < 400,
  json: async () => body,
  blob: async () => 'raw-blob',
  headers: { get: () => null }
})

const generation = (overrides = {}) => ({
  id: 'horde-image-id',
  img: 'https://r2.example.com/image.webp',
  seed: '4242',
  model: 'Deliberate',
  censored: false,
  worker_id: 'worker-id',
  worker_name: 'worker-name',
  ...overrides
})

const createFakeHorde = () => {
  const horde = {
    submissions: [] as Array<{ body: any; headers: any }>,
    submitResponses: [] as Array<any>,
    checkResponse: response(200, {
      done: false,
      waiting: 1,
      processing: 0,
      wait_time: 30,
      queue_position: 2,
      is_possible: true
    }) as any,
    statusResponse: response(200, {
      generations: [generation()],
      kudos: 10,
      shared: false
    }) as any,
    finishJob(): void {
      horde.checkResponse = response(200, {
        done: true,
        waiting: 0,
        processing: 0,
        wait_time: 0,
        is_possible: true
      })
    },
    fetch: jest.fn(async (url: string, options: any = {}): Promise<any> => {
      if (url.endsWith('/api/v2/generate/async')) {
        const number = horde.submissions.length + 1
        horde.submissions.push({
          body: JSON.parse(options.body),
          headers: options.headers
        })

        const scripted: any = horde.submitResponses.shift()
        if (scripted instanceof Error) throw scripted
        return scripted ?? response(202, { id: `horde-${number}`, kudos: 10 })
      }

      if (url.includes('/api/v2/generate/check/')) return horde.checkResponse
      if (url.includes('/api/v2/generate/status/')) return horde.statusResponse
      return response(200)
    })
  }

  return horde
}

// These need a real canvas. They're spied on after loading, rather than with
// jest.mock, because imageUtils and ImageParamsForApi import each other and a
// partial mock would hand one of them a half-built module.
const stubBrowserImageHelpers = () => {
  const imageUtils = require('app/_utils/imageUtils')
  const helperUtils = require('app/_utils/helperUtils')

  jest.spyOn(imageUtils, 'base64toBlob').mockImplementation(async () => ({
    addOrUpdateExifData: async () => 'stamped-blob'
  }))
  jest
    .spyOn(imageUtils, 'generateBase64Thumbnail')
    .mockImplementation(async () => 'THUMBNAIL')
  jest
    .spyOn(imageUtils, 'isBase64UrlImage')
    .mockImplementation(async () => mockImages.isValid)
  jest
    .spyOn(helperUtils, 'blobToBase64')
    .mockImplementation(async () => 'data:image/webp;base64,RAW')
}

const load = () => ({
  CreateImageRequest: require('app/_data-models/CreateImageRequest').default,
  AppSettings: require('app/_data-models/AppSettings').default,
  appStore: require('app/_store/appStore'),
  cache: require('app/_controllers/pendingJobsCache'),
  controller: require('app/_controllers/pendingJobsController'),
  database: require('app/_utils/db'),
  dexie: require('app/_db/dexie').db,
  imageCache: require('app/_utils/imageCache'),
  pendingUtils: require('app/_utils/pendingUtils')
})

const waitFor = async (assertion: () => Promise<void> | void) => {
  const deadline = Date.now() + 2000
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      return await assertion()
    } catch (err) {
      lastError = err
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }

  throw lastError
}

describe('image job lifecycle', () => {
  let app: ReturnType<typeof load>
  let horde: ReturnType<typeof createFakeHorde>

  const request = (overrides = {}) =>
    new app.CreateImageRequest({
      prompt: 'a cat in a hat',
      models: ['Deliberate'],
      numImages: 1,
      sampler: 'k_euler',
      steps: 20,
      cfg_scale: 7,
      width: 512,
      height: 512,
      ...overrides
    })

  const queueJobs = async (overrides = {}) => {
    await app.pendingUtils.createPendingJob(request(overrides))
    await app.controller.fetchPendingImageJobs()
  }

  const submitJob = async (overrides = {}) => {
    await queueJobs(overrides)
    await app.controller.createImageJobs()
    return app.cache.getPendingJob('horde-1')
  }

  const allCached = () => app.cache.getAllPendingJobs() as any[]

  beforeEach(async () => {
    jest.resetModules()
    localStorage.clear()
    mockImages.isValid = true

    horde = createFakeHorde()
    global.fetch = horde.fetch as any

    app = load()
    stubBrowserImageHelpers()
    await Promise.all(app.dexie.tables.map((table: any) => table.clear()))
    await app.cache.deletePendingJobs()
  })

  afterEach(() => {
    app.dexie.close()
  })

  it('does not write startup defaults after a backup begins during initialization', async () => {
    let finish!: () => void
    require('app/_utils/analytics').trackNewSession.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve
      })
    )
    const { initAppSettings } = require('app/_utils/initArtBotAppSettings')
    const initializing = initAppSettings()
    localStorage.setItem(
      'ArtBotLibrarySelection:operation',
      JSON.stringify({ expires: Date.now() + 30000 })
    )
    finish()
    try {
      await expect(initializing).resolves.toBeUndefined()
    } finally {
      localStorage.removeItem('ArtBotLibrarySelection:operation')
    }
  })

  it('recovers a claim that ages out after a quick reload without resubmitting it', async () => {
    await app.dexie.pending.add({
      jobId: 'interrupted',
      jobStatus: JobStatus.Requested,
      requestedAt: Date.now()
    })
    await app.cache.initLoadPendingJobsFromDb()
    await app.controller.fetchPendingImageJobs()
    const clock = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 180000)
    try {
      await app.controller.fetchPendingImageJobs()
      expect(app.cache.getPendingJob('interrupted').jobStatus).toBe(
        JobStatus.Error
      )
      expect(horde.submissions).toHaveLength(0)
    } finally {
      clock.mockRestore()
    }
  })

  describe('queueing', () => {
    it('creates one waiting job per requested image', async () => {
      await queueJobs({ numImages: 3 })

      expect(await app.database.pendingCount()).toBe(3)
      expect(allCached().map((job) => job.jobStatus)).toEqual(
        Array(3).fill(JobStatus.Waiting)
      )
      expect(new Set(allCached().map((job) => job.jobId)).size).toBe(3)
    })

    it('creates jobs for every model and image combination', async () => {
      await queueJobs({ models: ['Deliberate', 'Anything'], numImages: 2 })

      const models = allCached().map((job) => job.models[0])
      expect(models.sort()).toEqual([
        'Anything',
        'Anything',
        'Deliberate',
        'Deliberate'
      ])
    })

    it('ignores a "use all models" setting saved before it was removed', async () => {
      await queueJobs({ useAllModels: true, numImages: 2 })

      expect(allCached()).toHaveLength(2)
      expect(allCached().map((job) => job.models)).toEqual([
        ['Deliberate'],
        ['Deliberate']
      ])
      expect(allCached().every((job) => job.useAllModels === false)).toBe(true)
    })

    it('ignores a blank prompt', async () => {
      const result = await app.pendingUtils.createPendingJob(
        request({ prompt: '   ' })
      )

      expect(result).toEqual([])
      expect(await app.database.pendingCount()).toBe(0)
    })

    it.each([
      [0, 1],
      [-4, 1],
      [201, 200]
    ])('clamps %i requested images to %i', async (numImages, expected) => {
      const params = request()
      params.numImages = numImages

      await app.pendingUtils.createPendingJob(params)

      expect(await app.database.pendingCount()).toBe(expected)
    })

    it('reloads waiting jobs from IndexedDB after a page refresh', async () => {
      await queueJobs({ numImages: 2 })
      await app.cache.deletePendingJobs()
      expect(allCached()).toEqual([])

      await app.cache.initLoadPendingJobsFromDb()

      expect(allCached()).toHaveLength(2)
    })
  })

  describe('submitting to the Horde', () => {
    it('sends a single image request with the expected shape', async () => {
      await submitJob()

      expect(horde.submissions).toHaveLength(1)
      const [{ body, headers }] = horde.submissions

      expect(body.prompt).toContain('a cat in a hat')
      expect(body.models).toEqual(['Deliberate'])
      expect(body.params).toMatchObject({
        n: 1,
        sampler_name: 'k_euler',
        steps: 20,
        width: 512,
        height: 512
      })
      expect(headers['Client-Agent']).toMatch(/^ArtBot/)
      expect(headers.apikey).toBe('0000000000')
    })

    it('uses the saved API key', async () => {
      app.AppSettings.set('apiKey', 'my-key')
      await submitJob()
      expect(horde.submissions[0].headers.apikey).toBe('my-key')
    })

    it('replaces the temporary job id with the Horde job id', async () => {
      await queueJobs()
      const [{ jobId: temporaryId }] = allCached()

      await app.controller.createImageJobs()

      expect(app.cache.getPendingJob(temporaryId)).toBeUndefined()
      expect(app.cache.getPendingJob('horde-1')).toMatchObject({
        jobStatus: JobStatus.Queued,
        wait_time: 30,
        queue_position: 2
      })

      await waitFor(async () => {
        const stored = await app.database.getPendingJobDetails('horde-1')
        expect(stored.jobStatus).toBe(JobStatus.Queued)
      })
      expect(await app.database.pendingCount()).toBe(1)
    })

    it('sends at most two jobs per pass', async () => {
      await queueJobs({ numImages: 3 })

      await app.controller.createImageJobs()

      expect(horde.submissions).toHaveLength(2)
      expect(app.cache.getAllPendingJobs(JobStatus.Waiting)).toHaveLength(1)
    })

    // A long database export holds a read transaction, which blocks the claim.
    // Passes keep running every 1.1 seconds meanwhile.
    it('never claims a job twice while its claim is blocked', async () => {
      await queueJobs({ numImages: 3 })
      const Dexie = require('dexie').default
      const claims = jest.spyOn(app.database, 'claimPendingJobForSubmission')

      let finishExport!: () => void
      const exportDone = new Promise<void>((resolve) => {
        finishExport = resolve
      })
      const exporting = app.dexie.transaction('r', app.dexie.pending, () =>
        Dexie.waitFor(exportDone)
      )

      const firstPass = app.controller.createImageJobs()
      await waitFor(() => expect(claims).toHaveBeenCalledTimes(1))
      // The cache still says Waiting, so this pass must skip the job that
      // is being claimed and move on to the others.
      const secondPass = app.controller.createImageJobs()

      finishExport()
      await Promise.all([exporting, firstPass, secondPass])

      const claimedIds = claims.mock.calls.map(([id]) => id)
      expect(new Set(claimedIds).size).toBe(claimedIds.length)
      expect(horde.submissions).toHaveLength(3)
    })

    it('stops sending once the concurrency limit is reached', async () => {
      await queueJobs({ numImages: 7 })

      for (let pass = 0; pass < 5; pass++) {
        await app.controller.createImageJobs()
      }

      // Two passes reach 4 active jobs, a third crosses the limit of 5.
      expect(horde.submissions).toHaveLength(6)
    })

    it('holds the queue when paused', async () => {
      app.AppSettings.set('pauseJobQueue', true)
      await submitJob()
      expect(horde.submissions).toHaveLength(0)
    })

    it('holds the queue when browser storage is full', async () => {
      app.appStore.setStorageQuotaLimit(true)
      await submitJob()
      expect(horde.submissions).toHaveLength(0)
    })
  })

  describe('when a submission fails', () => {
    const onlyJob = () => allCached()[0]

    it('returns a rate limited job to the queue', async () => {
      horde.submitResponses.push(response(429, { message: 'slow down' }))

      await submitJob()

      expect(onlyJob().jobStatus).toBe(JobStatus.Waiting)
    })

    it.each([
      [400, 'bad params'],
      [401, 'bad key'],
      [403, 'forbidden'],
      [503, 'maintenance']
    ])('marks the job failed on HTTP %i', async (status, message) => {
      horde.submitResponses.push(response(status, { message }))

      await submitJob()

      expect(onlyJob()).toMatchObject({
        jobStatus: JobStatus.Error,
        errorMessage: message
      })
    })

    it('marks the job failed when the network request throws', async () => {
      horde.submitResponses.push(new Error('network down'))

      await submitJob()

      expect(onlyJob().jobStatus).toBe(JobStatus.Error)
    })

    it('can send another job after a thrown request', async () => {
      horde.submitResponses.push(new Error('network down'))
      await submitJob({ numImages: 2 })

      expect(horde.submissions).toHaveLength(2)
    })

    it('can send another job after one has malformed params', async () => {
      await queueJobs({ numImages: 2 })
      const [malformed, valid] = allCached()

      // Submission now reads the authoritative record while claiming it.
      await app.dexie.pending.update(malformed.id, {
        post_processing: null
      })
      const result = await app.imageCache.sendJobToApi(malformed)
      expect(result).toMatchObject({
        success: false,
        status: 'UNKNOWN_ERROR'
      })
      expect(app.cache.getPendingJob(malformed.jobId).jobStatus).toBe(
        JobStatus.Error
      )

      await app.imageCache.sendJobToApi(valid)

      expect(horde.submissions).toHaveLength(1)
    })
  })

  describe('polling', () => {
    const poll = () =>
      app.imageCache.checkCurrentJob(app.cache.getPendingJob('horde-1'))

    it('tracks a job that is processing', async () => {
      await submitJob()
      horde.checkResponse = response(200, {
        done: false,
        waiting: 0,
        processing: 1,
        wait_time: 12,
        is_possible: true
      })

      await poll()

      expect(app.cache.getPendingJob('horde-1')).toMatchObject({
        jobStatus: JobStatus.Processing,
        wait_time: 12
      })
    })

    it('tracks queue position while waiting', async () => {
      await submitJob()
      horde.checkResponse = response(200, {
        done: false,
        waiting: 1,
        processing: 0,
        wait_time: 99,
        queue_position: 7,
        is_possible: false
      })

      await poll()

      expect(app.cache.getPendingJob('horde-1')).toMatchObject({
        jobStatus: JobStatus.Queued,
        queue_position: 7,
        is_possible: false
      })
    })

    it('removes a job the Horde no longer knows about', async () => {
      await submitJob()
      horde.checkResponse = response(404, { message: 'not found' })

      const result = await poll()

      expect(result).toEqual({ success: false, status: 'NOT_FOUND' })
      expect(app.cache.getPendingJob('horde-1')).toBeUndefined()
      await waitFor(async () => {
        expect(await app.database.pendingCount()).toBe(0)
      })
    })

    it('leaves the job alone when the check is rate limited', async () => {
      await submitJob()
      horde.checkResponse = response(429)

      await poll()

      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
        JobStatus.Queued
      )
    })

    it('retains a queued job when browser storage is full', async () => {
      await submitJob()
      app.appStore.setStorageQuotaLimit(true)

      expect(await poll()).toEqual({ success: false })
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
        JobStatus.Queued
      )
    })
  })

  describe('when an image finishes', () => {
    const poll = () =>
      app.imageCache.checkCurrentJob(app.cache.getPendingJob('horde-1'))

    const makeJobOld = () => {
      const job = app.cache.getPendingJob('horde-1')
      job.timestamp = Date.now() - 120000
      app.cache.updatePendingJobV2(job)
    }

    it('saves the finished image to the gallery table', async () => {
      await submitJob()
      horde.finishJob()

      const result = await poll()

      expect(result).toEqual({
        success: true,
        jobId: 'horde-1',
        newImage: true
      })
      expect(await app.database._getImageDetails('horde-1')).toMatchObject({
        base64String: 'STAMPED',
        thumbnail: 'THUMBNAIL',
        jobStatus: JobStatus.Done,
        prompt: expect.stringContaining('a cat in a hat'),
        seed: '4242',
        kudos: 10,
        hordeImageId: 'horde-image-id',
        worker_name: 'worker-name'
      })
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(JobStatus.Done)
    })

    it('retains and saves a finished result after a failed durable write', async () => {
      await submitJob()
      horde.finishJob()
      const write = jest
        .spyOn(app.dexie.completed, 'put')
        .mockRejectedValueOnce(
          new DOMException('Storage full', 'QuotaExceededError')
        )
      expect(await poll()).toEqual({ success: false })
      write.mockRestore()
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
        JobStatus.Queued
      )
      expect(await app.dexie.completed.count()).toBe(0)
      app.appStore.setStorageQuotaLimit(false)
      await poll()
      expect(await app.dexie.completed.count()).toBe(1)
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(JobStatus.Done)
      expect(horde.submissions).toHaveLength(1)
    })

    it('flags that a new image is ready', async () => {
      await submitJob()
      horde.finishJob()

      await poll()

      expect(app.appStore.appInfoStore.state.newImageReady).toBe('horde-1')
    })

    it('does not save an image twice', async () => {
      await submitJob()
      horde.finishJob()
      const job = app.cache.getPendingJob('horde-1')

      await app.imageCache.checkCurrentJob({ ...job })
      await app.imageCache.checkCurrentJob({ ...job })

      expect(await app.database.imageCount()).toBe(1)
    })

    // Real batching will depend on this changing: only two images survive.
    it('keeps only the first two images a job returns', async () => {
      await submitJob()
      horde.finishJob()
      horde.statusResponse = response(200, {
        kudos: 30,
        generations: [
          generation({ id: 'one' }),
          generation({ id: 'two' }),
          generation({ id: 'three' })
        ]
      })

      await poll()

      const saved = await app.database._allCompletedJobs()
      expect(saved.map((image: any) => image.hordeImageId)).toEqual([
        'one',
        'two'
      ])
      await waitFor(async () => {
        const extras = await app.database.getJobImagesFromDexie('horde-1')
        expect(extras.map((image: any) => image.type)).toEqual(['ab-test'])
      })
    })

    it.each([
      ['a faulted job', { faulted: true }],
      ['a censored image', { generations: [generation({ censored: true })] }]
    ])('fails %s once it is over a minute old', async (_name, body) => {
      await submitJob()
      makeJobOld()
      horde.finishJob()
      horde.statusResponse = response(200, body)

      await poll()

      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(JobStatus.Error)
      expect(await app.database.imageCount()).toBe(0)
    })

    it.each([
      ['a faulted job', { faulted: true }],
      ['a censored image', { generations: [generation({ censored: true })] }]
    ])('gives %s a minute before failing it', async (_name, body) => {
      await submitJob()
      horde.finishJob()
      horde.statusResponse = response(200, body)

      await poll()

      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
        JobStatus.Queued
      )
    })

    it('does not save anything when the status call is rate limited', async () => {
      await submitJob()
      horde.finishJob()
      horde.statusResponse = response(429)

      expect(await poll()).toEqual({ newImage: false })
      expect(await app.database.imageCount()).toBe(0)
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
        JobStatus.Queued
      )
    })

    // A finished image that won't download is usually a network blip.
    // Failing it would make the user pay for the image again.
    it('keeps a finished job whose image fails to download, then saves it', async () => {
      await submitJob()
      horde.finishJob()
      mockImages.isValid = false

      expect(await poll()).toEqual({
        success: false,
        status: 'IMAGE_DOWNLOAD_RETRY'
      })
      expect(app.cache.getPendingJob('horde-1').jobStatus).not.toBe(
        JobStatus.Error
      )

      mockImages.isValid = true
      expect(await poll()).toMatchObject({ success: true, newImage: true })
      expect(await app.database._getImageDetails('horde-1')).toBeTruthy()
    })

    it('fails a job whose image still cannot be downloaded after two minutes', async () => {
      await submitJob()
      horde.finishJob()
      mockImages.isValid = false
      expect((await poll()).status).toBe('IMAGE_DOWNLOAD_RETRY')

      const realNow = Date.now.bind(Date)
      const later = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => realNow() + 2 * 60 * 1000 + 1000)
      try {
        expect(await poll()).toEqual({
          success: false,
          status: 'INVALID_IMAGE_FROM_API'
        })
      } finally {
        later.mockRestore()
      }
      expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(JobStatus.Error)
    })

    // Metadata is a nice-to-have. The user has already spent kudos on the image.
    describe('when the prompt cannot be written into the image', () => {
      const imageUtils = () => require('app/_utils/imageUtils')

      it.each([
        [
          'the image cannot be read as a blob',
          () => jest.spyOn(imageUtils(), 'base64toBlob').mockResolvedValue(null)
        ],
        [
          'writing the metadata throws',
          () =>
            jest.spyOn(imageUtils(), 'base64toBlob').mockResolvedValue({
              addOrUpdateExifData: async () => {
                throw new TypeError('no EXIF data')
              }
            })
        ]
      ])('saves the original image when %s', async (_name, breakStamping) => {
        await submitJob()
        horde.finishJob()
        breakStamping()

        const result = await poll()

        expect(result).toEqual({
          success: true,
          jobId: 'horde-1',
          newImage: true
        })
        expect(await app.database._getImageDetails('horde-1')).toMatchObject({
          base64String: 'RAW',
          jobStatus: JobStatus.Done
        })
        expect(app.cache.getPendingJob('horde-1').jobStatus).toBe(
          JobStatus.Done
        )
      })
    })
  })
})
