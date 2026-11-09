/**
 * @jest-environment ./test-utils/jsdomWithIndexedDb.js
 *
 * Rebuilds a Horde request from every real saved image, which is what happens
 * when a user rerolls an image from their library.
 */
import ImageParamsForApi from './ImageParamsForApi'

const schema = require('test-utils/hordeApiSchema.json')
const library = require('e2e/fixtures/library.json')

const realImages: any[] = library.completed

const rowNamed = (name: string) =>
  realImages.find((row) => row.fixtureName === name)

const build = (row: any): any =>
  JSON.parse(JSON.stringify(new ImageParamsForApi(row)))

const unknownKeys = (object: object, allowed: string[]) =>
  Object.keys(object).filter((key) => !allowed.includes(key))

describe.each(realImages.map((row) => [row.fixtureName, row]))(
  'a saved %s image',
  (_name, row) => {
    it('rebuilds into a request the Horde accepts', () => {
      const request = build(row)

      expect(unknownKeys(request, schema.topLevel)).toEqual([])
      expect(unknownKeys(request.params, schema.params)).toEqual([])
      expect(request.models).toEqual(row.models)
      expect(request.prompt).toContain(row.prompt)
    })
  }
)

describe('features saved with real images', () => {
  it('keeps the LoRA', () => {
    expect(build(rowNamed('large-lora')).params.loras).toEqual([
      { name: '58390', model: 1, clip: 1 }
    ])
  })

  it('keeps the embedding', () => {
    expect(build(rowNamed('large-embedding')).params.tis).toEqual([
      { name: '7808', inject_ti: 'negprompt', strength: 1 }
    ])
  })

  it('keeps hires fix', () => {
    expect(build(rowNamed('large-hires-fix')).params.hires_fix).toBe(true)
  })

  it('keeps the face fixer', () => {
    const { params } = build(rowNamed('large-face-fix'))

    expect(params.post_processing).toEqual(['GFPGAN'])
    expect(params.facefixer_strength).toBe(0.75)
  })

  it('keeps the img2img source image', () => {
    const row = rowNamed('large-img2img')
    const request = build(row)

    expect(request.source_processing).toBe('img2img')
    expect(request.source_image).toBe(row.source_image)
  })

  it('keeps the inpainting image and mask', () => {
    const row = rowNamed('large-inpainting')
    const request = build(row)

    expect(request.source_processing).toBe('inpainting')
    expect(request.source_image).toBe(row.source_image)
    expect(request.source_mask).toBe(row.source_mask)
  })

  it('sends ControlNet without a sampler', () => {
    const { params, source_image } = build(rowNamed('large-controlnet'))

    expect(params.control_type).toBe('canny')
    expect(params.sampler_name).toBeUndefined()
    expect(source_image).toBeTruthy()
  })
})
