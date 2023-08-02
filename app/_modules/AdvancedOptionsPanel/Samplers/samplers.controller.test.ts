import { SourceProcessing } from '../../../../utils/promptUtils'
import { samplerOptions } from './samplers.controller'

describe('samplers.controller.ts', () => {
  describe('samplerOptions', () => {
    const testCases = [
      {
        description: 'handle stable_diffusion_2.0',
        input: { models: ['stable_diffusion_2.0'] },
        result: [{ value: 'dpmsolver', label: 'dpmsolver' }]
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        // @ts-ignore
        expect(samplerOptions(instance.input)).toStrictEqual(instance.result)
      })
    })

    test('handle samplers for img2img', () => {
      const samplers = samplerOptions({
        source_processing: SourceProcessing.Img2Img,
        models: ['stable_diffusion']
      })

      expect(samplers.length).toBe(8)
    })

    test('handle samplers for text2img', () => {
      const samplers = samplerOptions({
        source_processing: SourceProcessing.Prompt,
        models: ['stable_diffusion']
      })

      expect(samplers.length).toBe(13)
    })
  })
})
