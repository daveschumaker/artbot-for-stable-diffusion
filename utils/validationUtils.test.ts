import { hasSourceImg, maxSteps } from './validationUtils'

describe('validationUtils', () => {
  describe('anonMaxSteps', () => {
    test('limit steps for anonymous users', () => {
      expect(maxSteps({ sampler: 'k_dpm_2_a' })).toBe(25)
      expect(maxSteps({ sampler: 'k_euler' })).toBe(50)
    })

    test('max steps for logged in users', () => {
      expect(maxSteps({ sampler: 'k_dpm_2_a', loggedIn: true })).toBe(500)
      expect(maxSteps({ sampler: 'k_euler', loggedIn: true })).toBe(500)
    })

    test('max steps for anonymous users with slider', () => {
      expect(maxSteps({ sampler: 'k_dpm_2_a', isSlider: true })).toBe(25)
      expect(maxSteps({ sampler: 'k_euler', isSlider: true })).toBe(50)
    })

    test('max steps for logged in users with slider', () => {
      expect(
        maxSteps({ sampler: 'k_dpm_2_a', loggedIn: true, isSlider: true })
      ).toBe(150)
      expect(
        maxSteps({ sampler: 'k_euler', loggedIn: true, isSlider: true })
      ).toBe(150)
    })
  })

  describe('hasSourceImg', () => {
    const testCases = [
      {
        description: 'source image is a string',
        input: { source_image: 'abc' },
        result: true
      },
      {
        description: 'source image is missing',
        input: {},
        result: false
      },
      {
        description: 'source image is not a string',
        input: { source_image: true },
        result: false
      },
      {
        description: 'source image is empty',
        input: { source_image: '' },
        result: false
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        expect(hasSourceImg(instance.input)).toBe(instance.result)
      })
    })
  })
})
