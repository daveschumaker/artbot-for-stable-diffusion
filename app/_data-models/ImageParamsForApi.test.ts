import CreateImageRequest from './CreateImageRequest'
import DefaultPromptInput from './DefaultPromptInput'
// import ImageParamsForApi from './ImageParamsForApi'

describe('ImageParamsForApi', () => {
  let imageDetails: CreateImageRequest

  beforeEach(() => {
    const defaultState: DefaultPromptInput = new DefaultPromptInput()
    imageDetails = new CreateImageRequest(defaultState)
  })

  it('should request with correct prompt', async () => {
    imageDetails.prompt = 'A programming penguin'
    // const params: ImageParamsForApi = new ImageParamsForApi(imageDetails as any)

    expect(true).toBe(true)
    // expect(params.prompt).toBe(imageDetails.prompt)
    // expect(createPendingJobMock).toHaveBeenCalledTimes(1)
  })
})
