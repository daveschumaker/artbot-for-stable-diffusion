import {
  hasSourceImg,
  isValidHttpUrl,
  maxSteps,
  validSampler
} from './validationUtils'

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
        // @ts-ignore
        expect(hasSourceImg(instance.input)).toBe(instance.result)
      })
    })
  })

  describe('validSampler', () => {
    const testCases = [
      {
        description: 'pass in known sampler',
        sampler: 'k_euler',
        result: true
      },
      {
        description: 'pass in "random" as sampler',
        sampler: 'random',
        result: true
      },
      {
        description: 'pass in known invalid sampler',
        sampler: 'huehuehuehehehehexyz',
        result: false
      },
      {
        description: 'pass in empty value for sampler',
        sampler: '',
        result: false
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        // @ts-ignore
        expect(validSampler(instance.sampler)).toBe(instance.result)
      })
    })
  })

  describe('isValidHttpUrl', () => {
    const testCases = [
      {
        description: 'pass in http url',
        string: 'http://tinybots.net',
        result: true
      },
      {
        description: 'pass in https url',
        string: 'https://tinybots.net',
        result: true
      },
      {
        description: 'pass in string without protocol',
        string: 'tinybots.net',
        result: false
      },
      {
        description: 'pass in url with invalid protocol',
        string: 'tel://1234567890',
        result: false
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        // @ts-ignore
        expect(isValidHttpUrl(instance.string)).toBe(instance.result)
      })
    })
  })
})
