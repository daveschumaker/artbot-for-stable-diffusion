/**
 * @jest-environment ./test-utils/jsdomWithIndexedDb.js
 *
 * Checks the requests ArtBot builds against a saved copy of the AI Horde schema
 * (test-utils/hordeApiSchema.json). To pick up Horde changes, regenerate that
 * file from https://aihorde.net/api/swagger.json.
 */
import { CONTROL_TYPE_ARRAY, DEFAULT_SAMPLER_ARRAY } from '_constants'
import ImageParamsForApi from './ImageParamsForApi'
import Samplers from './Samplers'
import Upscalers from './Upscalers'
import AppSettings from './AppSettings'
import { SourceProcessing } from 'app/_utils/promptUtils'

const schema = require('test-utils/hordeApiSchema.json')

const baseJob = {
  cfg_scale: 7,
  height: 512,
  width: 512,
  models: ['Deliberate'],
  negative: '',
  prompt: 'a cat',
  sampler: 'k_euler',
  seed: '',
  source_processing: SourceProcessing.Prompt,
  steps: 20
}

const build = (overrides = {}): any =>
  JSON.parse(
    JSON.stringify(new ImageParamsForApi({ ...baseJob, ...overrides } as any))
  )

const unknownKeys = (object: object, allowed: string[]) =>
  Object.keys(object).filter((key) => !allowed.includes(key))

const lora = { name: '123', model: 1, clip: 1 }

const scenarios: Array<[string, any, (request: any) => unknown]> = [
  ['text to image', {}, (r) => r.params.n],
  [
    'img2img with a mask',
    {
      source_processing: SourceProcessing.Img2Img,
      source_image: 'abc',
      source_mask: 'def',
      denoising_strength: 0.5
    },
    (r) => r.source_mask
  ],
  [
    'inpainting',
    {
      source_processing: SourceProcessing.InPainting,
      source_image: 'abc',
      source_mask: 'def',
      denoising_strength: 0.5
    },
    (r) => r.source_processing
  ],
  [
    'ControlNet',
    {
      control_type: 'canny',
      source_image: 'abc',
      image_is_control: true,
      return_control_map: true
    },
    (r) => r.params.control_type
  ],
  ['a LoRA', { loras: [lora] }, (r) => r.params.loras[0].name],
  [
    'a LoRA pinned to a version',
    { loras: [{ ...lora, versionId: 456 }] },
    (r) => r.params.loras[0].is_version
  ],
  [
    'an embedding',
    { tis: [{ name: 'ti', strength: 0.5, inject_ti: 'prompt' }] },
    (r) => r.params.tis[0].strength
  ],
  ['hires fix', { hires: true }, (r) => r.params.hires_fix],
  [
    'a face fixer',
    { facefixer_strength: 0.6 },
    (r) => r.params.facefixer_strength
  ],
  [
    'post processing',
    { post_processing: ['GFPGAN', 'RealESRGAN_x4plus'] },
    (r) => r.params.post_processing.length
  ],
  [
    'a QR code workflow',
    {
      workflow: 'qr_code',
      extra_texts: [{ text: 'url', reference: 'qr_text' }]
    },
    (r) => r.params.extra_texts.length
  ]
]

describe('requests sent to the AI Horde', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe.each(scenarios)('for %s', (_name, job, feature) => {
    let request: any

    beforeEach(() => {
      request = build(job)
    })

    it('actually includes the feature', () => {
      expect(feature(request)).toBeTruthy()
    })

    it('only uses fields the Horde accepts', () => {
      expect(unknownKeys(request, schema.topLevel)).toEqual([])
      expect(unknownKeys(request.params, schema.params)).toEqual([])
    })

    it('only uses LoRA and embedding fields the Horde accepts', () => {
      for (const item of request.params.loras ?? []) {
        expect(unknownKeys(item, schema.lora)).toEqual([])
      }

      for (const item of request.params.tis ?? []) {
        expect(unknownKeys(item, schema.ti)).toEqual([])
      }
    })

    it('stays within the batch limit', () => {
      expect(request.params.n).toBeLessThanOrEqual(schema.maxImagesPerRequest)
    })
  })

  it('accepts the worker fields for a blocklist', () => {
    AppSettings.set('useBlockedWorkers', true)
    AppSettings.set('blockedWorkers', [{ value: 'worker-1' }])

    const request = build()

    expect(request.workers).toEqual(['worker-1'])
    expect(request.worker_blacklist).toBe(true)
    expect(unknownKeys(request, schema.topLevel)).toEqual([])
  })

  it('accepts the worker fields for an allowlist', () => {
    AppSettings.set('useAllowedWorkers', true)
    AppSettings.set('allowedWorkers', [{ value: 'worker-2' }])

    const request = build()

    expect(request.workers).toEqual(['worker-2'])
    expect(unknownKeys(request, schema.topLevel)).toEqual([])
  })

  it('strips images from error logs', () => {
    const request = new ImageParamsForApi(
      {
        ...baseJob,
        source_processing: SourceProcessing.Img2Img,
        source_image: 'secret-image',
        source_mask: 'secret-mask'
      } as any,
      { hasError: true }
    ) as any

    expect(request.source_image).not.toContain('secret-image')
    expect(request.source_mask).not.toContain('secret-mask')
  })

  // Known bug: `=== (InPainting || OutPainting)` only ever compares InPainting.
  it.failing('includes the source image for outpainting', () => {
    const request = build({
      source_processing: SourceProcessing.OutPainting,
      source_image: 'abc',
      source_mask: 'def'
    })

    expect(request.source_image).toBe('abc')
  })
})

describe('options ArtBot offers', () => {
  it('only offers samplers the Horde supports', () => {
    const offered = [
      ...DEFAULT_SAMPLER_ARRAY,
      ...Object.keys(Samplers.samplerDetails())
    ]

    expect(offered.filter((s) => !schema.samplers.includes(s))).toEqual([])
  })

  it('only offers upscalers the Horde supports', () => {
    expect(
      Upscalers.upscalers.filter((u) => !schema.postProcessing.includes(u))
    ).toEqual([])
  })

  it('only offers ControlNet types the Horde supports', () => {
    expect(
      CONTROL_TYPE_ARRAY.filter(
        (type) => type && !schema.controlTypes.includes(type)
      )
    ).toEqual([])
  })
})
