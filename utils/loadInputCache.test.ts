import {
  CreatePageMode,
  IQuery,
  isSharedLink,
  shouldLoadUserInputCache
} from './loadInputCache'

describe('loadInputCache', () => {
  describe('match query params', () => {
    interface TestCase {
      description: string
      test(): void
      result: string
    }

    const testCases: Array<TestCase> = [
      {
        description: 'query param is ?edit=true',
        test: function () {
          const router = { query: { edit: 'true' } }
          return router.query[CreatePageMode.EDIT]
        },
        result: 'true'
      },
      {
        description: 'query param is ?drawing=true',
        test: function () {
          const router = { query: { drawing: 'true' } }
          return router.query[CreatePageMode.LOAD_DRAWING]
        },
        result: 'true'
      },
      {
        description: 'query param is ?model=stable_diffusion',
        test: function () {
          const router = { query: { model: 'stable_diffusion' } }
          return router.query[CreatePageMode.LOAD_MODEL]
        },
        result: 'stable_diffusion'
      },
      {
        description:
          'query param for model has spaces: ?model=Cheese%20Daddys%20Landscape%20Mix',
        test: function () {
          const router = { query: { model: 'Cheese Daddys Landscape Mix' } }
          return router.query[CreatePageMode.LOAD_MODEL]
        },
        result: 'Cheese Daddys Landscape Mix'
      },
      {
        description: 'query param is ?share=xyz123',
        test: function () {
          const router = { query: { share: 'xyz123' } }
          return router.query[CreatePageMode.SHARE]
        },
        result: 'xyz123'
      },
      {
        description: 'query param is ?i=xyz123',
        test: function () {
          const router = { query: { i: 'xyz123' } }
          return router.query[CreatePageMode.SHORTLINK]
        },
        result: 'xyz123'
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        expect(instance.test()).toBe(instance.result)
      })
    })
  })

  describe('shouldLoadUserInputCache', () => {
    const testCases = [
      {
        description: 'query param is ?edit=true',
        test: function () {
          const router = { query: { edit: 'true' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?drawing=true',
        test: function () {
          const router = { query: { drawing: 'true' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?model=stable_diffusion',
        test: function () {
          const router = { query: { model: 'stable_diffusion' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?share=xyz123',
        test: function () {
          const router = { query: { share: 'xyz123' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?i=xyz123',
        test: function () {
          const router = { query: { i: 'xyz123' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: false
      },
      {
        description: 'query param does not match expected value',
        test: function () {
          const router = { query: { hi: 'abc' } }
          return shouldLoadUserInputCache(router.query)
        },
        result: true
      },
      {
        description: 'query param is empty',
        test: function () {
          const router = { query: {} }
          return shouldLoadUserInputCache(router.query)
        },
        result: true
      },
      {
        description: 'no query params',
        test: function () {
          const router: { query?: IQuery } = {}
          return shouldLoadUserInputCache(router.query as IQuery)
        },
        result: true
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        expect(instance.test()).toBe(instance.result)
      })
    })
  })

  describe('isSharedLink', () => {
    const testCases = [
      {
        description: 'query param is ?edit=true',
        test: function () {
          const router = { query: { edit: 'true' } }
          return isSharedLink(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?drawing=true',
        test: function () {
          const router = { query: { drawing: 'true' } }
          return isSharedLink(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?model=stable_diffusion',
        test: function () {
          const router = { query: { model: 'stable_diffusion' } }
          return isSharedLink(router.query)
        },
        result: false
      },
      {
        description: 'query param is ?share=xyz123',
        test: function () {
          const router = { query: { share: 'xyz123' } }
          return isSharedLink(router.query)
        },
        result: true
      },
      {
        description: 'query param is ?i=xyz123',
        test: function () {
          const router = { query: { i: 'xyz123' } }
          return isSharedLink(router.query)
        },
        result: true
      },
      {
        description: 'query param does not match expected value',
        test: function () {
          const router = { query: { hi: 'abc' } }
          return isSharedLink(router.query)
        },
        result: false
      },
      {
        description: 'query param is empty',
        test: function () {
          const router = { query: {} }
          return isSharedLink(router.query)
        },
        result: false
      },
      {
        description: 'no query params',
        test: function () {
          const router: { query?: IQuery } = {}
          return isSharedLink(router.query as IQuery)
        },
        result: false
      }
    ]

    testCases.forEach((instance) => {
      test(instance.description, () => {
        expect(instance.test()).toBe(instance.result)
      })
    })
  })
})
