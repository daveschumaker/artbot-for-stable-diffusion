const createPendingJobMock = jest.fn(() => Promise.resolve(true))
jest.mock('../pendingUtils', () => ({
  createPendingJob: createPendingJobMock
}))

import { Common } from '_types'
import { createImageJob } from './createImageJob'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { CONTROL_TYPES, SourceProcessing } from '_types/horde'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'

const createBaseImageRequest = (): Partial<DefaultPromptInput> => ({
  cfg_scale: 8,
  orientationType: 'custom',
  height: 512,
  width: 512,
  karras: true,
  hires: true,
  clipskip: 1,
  models: ['Deliberate'],
  sampler: 'k_dpm_2_a',
  negative: 'illustration, anime, painting, low quality, worst quality',
  numImages: 1,
  parentJobId: '54fe4c8d-e3da-41e5-a1a6-e15aef4a1840',
  post_processing: [],
  prompt: 'test image',
  seed: '',
  source_image: '',
  source_mask: '',
  source_processing: SourceProcessing.Prompt,
  loras: [],
  denoising_strength: Common.Empty,
  control_type: '' as CONTROL_TYPES,
  image_is_control: false,
  return_control_map: false,
  steps: 22,
  triggers: [],
  useAllModels: false,
  useAllSamplers: false,
  useMultiClip: false,
  useMultiDenoise: false,
  useMultiGuidance: true,
  useMultiSteps: false,
  canvasData: null,
  maskData: null,
  tiling: false
})

describe('createImageJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create 1 job without any modifications', async () => {
    const newImageRequest = createBaseImageRequest()
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(1)
  })

  it('should create 4 jobs with different CLIP values', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      useMultiClip: true,
      multiClip: '1, 2, 3, 4'
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(4)
  })

  it('should create 2 jobs with useMultiGuidance', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      useMultiGuidance: true,
      multiGuidance: '1, 2'
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(2)
  })

  it('should create 3 jobs with different denoise values', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      useMultiDenoise: true,
      multiDenoise: '1, 2, 3',
      source_image: true as unknown as string
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(3)
  })

  it('should create 9 jobs with different denoise values and step counts', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      useMultiDenoise: true,
      multiDenoise: '1, 2, 3',
      useMultiSteps: true,
      multiSteps: '1, 2, 3',
      source_image: true as unknown as string
    }

    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(9)
  })

  it('should create correct number of jobs with useAllSamplers', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      useAllSamplers: true
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)

    // Hard code 11 for now, as that is the current number of samplers we have.
    expect(createPendingJobMock).toHaveBeenCalledTimes(11)
  })

  it('should create correct number of jobs with promptMatrix', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      prompt: 'Test {1|2|3}'
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(3)
  })

  it('should create correct number of jobs with negative promptMatrix', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      negative: 'Test {1|2|3}'
    }
    newImageRequest.negative = 'Test {1|2|3|4}'
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(4)
  })

  it('should create correct number of jobs with combination of positive and negative promptMatrix', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      prompt: 'Test {1|2}',
      negative: 'Test {1|2|3}'
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(createPendingJobMock).toHaveBeenCalledTimes(6)
  })

  it('should set the correct prompt and negative properties with promptMatrix', async () => {
    const newImageRequest = {
      ...createBaseImageRequest(),
      prompt: 'Test {1|2}',
      negative: 'Test {1|2|3}'
    }
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(true)
    expect(result.pendingJobArray).toHaveLength(6)
    // Check that each job in pendingJobArray has the correct prompt and negative properties
    result.pendingJobArray.forEach((job) => {
      expect(job.prompt).toMatch(/Test [1-2]/)
      expect(job.negative).toMatch(/Test [1-3]/)
    })
  })

  it('should handle errors gracefully', async () => {
    createPendingJobMock.mockRejectedValueOnce(new Error('Mock Error')) // Simulate an error
    const newImageRequest = createBaseImageRequest()
    const result = await createImageJob(
      newImageRequest as unknown as CreateImageRequest
    )

    expect(result.success).toBe(false)
    expect(result.status).toBe('error')
    expect(result.pendingJobArray).toEqual([])
  })
})
