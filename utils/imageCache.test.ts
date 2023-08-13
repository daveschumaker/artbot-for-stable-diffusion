jest.mock('./pendingUtils', () => ({
  createPendingJob: jest.fn(() => true)
}))

import CreateImageRequest from 'models/CreateImageRequest'
import { createImageJob } from './imageCache'

const baseImageRequest = {
  cfg_scale: 8,
  imageMimeType: 'image/webp',
  jobStatus: 'waiting',
  jobTimestamp: 1691885261079,
  orientation: 'custom',
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
  source_processing: 'prompt',
  loras: [],
  denoising_strength: '',
  control_type: '',
  image_is_control: false,
  return_control_map: false,
  multiClip: [],
  multiDenoise: [],
  multiGuidance: [],
  multiSteps: [],
  steps: 22,
  triggers: [],
  useAllModels: false,
  useAllSamplers: false,
  useMultiClip: false,
  useMultiDenoise: false,
  useMultiGuidance: true,
  useMultiSteps: false,
  shareImagesExternally: true,
  modelVersion: '2',
  canvasData: null,
  maskData: null,
  tiling: false
}

describe('createImageJob', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear mock function call history before each test
  })

  it('should create 1 job without any modifications', async () => {
    const newImageRequest = Object.assign({}, baseImageRequest)
    const result = await createImageJob(newImageRequest as CreateImageRequest)

    expect(result.success).toBe(true)
    expect(require('./pendingUtils').createPendingJob).toHaveBeenCalledTimes(1)
    // expect(createPendingJobMock).toHaveBeenCalledTimes(1)
  })

  it('should create 3 jobs with different denoise values', async () => {
    const newImageRequest = Object.assign({}, baseImageRequest)
    newImageRequest.useMultiDenoise = true
    newImageRequest.useMultiDenoise = true
    newImageRequest.source_image = true as unknown as string
    newImageRequest.multiDenoise = [1, 2, 3] as unknown as never[]
    const result = await createImageJob(newImageRequest as CreateImageRequest)

    expect(result.success).toBe(true)
    expect(require('./pendingUtils').createPendingJob).toHaveBeenCalledTimes(3)
  })

  it('should create 9 jobs with different denoise values and step counts', async () => {
    const newImageRequest = Object.assign({}, baseImageRequest)
    newImageRequest.useMultiDenoise = true
    newImageRequest.source_image = true as unknown as string
    newImageRequest.multiDenoise = [1, 2, 3] as unknown as never[]
    newImageRequest.useMultiSteps = true
    newImageRequest.multiSteps = [1, 2, 3] as unknown as never[]
    const result = await createImageJob(newImageRequest as CreateImageRequest)

    expect(result.success).toBe(true)
    expect(require('./pendingUtils').createPendingJob).toHaveBeenCalledTimes(9)
  })
})
