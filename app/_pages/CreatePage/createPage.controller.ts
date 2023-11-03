import { trackEvent, trackGaEvent } from 'app/_api/telemetry'
import AppSettings from 'app/_data-models/AppSettings'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { Dispatch } from 'react'
import { getCanvasStore, resetSavedDrawingState } from 'app/_store/canvasStore'
import { SetInput } from '_types'
import { logDataForDebugging } from 'app/_utils/debugTools'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { SourceProcessing, savePromptHistory } from 'app/_utils/promptUtils'
import { createImageJob } from 'app/_utils/V2/createImageJob'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'

interface CreateClick {
  pending: boolean
  input: DefaultPromptInput
  setPending: Dispatch<boolean>
  setErrors: Dispatch<any>
  setInput: SetInput
  router: any
  disableRedirect?: boolean
}

export const handleCreateClick = async ({
  pending,
  input,
  setPending,
  setErrors,
  setInput,
  router,
  disableRedirect = false
}: CreateClick) => {
  // TODO: Rather than directly send to API, we should queue up
  // jobs so we only ever send one job at a time to the API?

  if (pending) {
    return
  }

  if (!input?.prompt || input?.prompt.trim() === '') {
    setErrors({ PROMPT_EMPTY: true })
    return
  }

  setPending(true)

  const imageJobData = {
    ...input
  }

  if (getCanvasStore().cached && getCanvasStore().canvasRef) {
    imageJobData.canvasData = { ...getCanvasStore() }
  }

  // Handle weird error that's been cropping up where canvas is empty but inpainting is true:
  if (
    !input.source_mask &&
    input.source_processing === SourceProcessing.InPainting
  ) {
    setInput({
      source_processing: SourceProcessing.Prompt
    })
  }

  trackEvent({
    event: 'NEW_IMAGE_REQUEST',
    context: '/pages/index',
    data: {
      orientation: input.orientationType,
      sampler: input.sampler,
      steps: input.steps,
      numImages: input.numImages,
      model: input.models,
      source: input.source_processing,
      post_processing: input.post_processing
    }
  })
  trackGaEvent({
    action: 'new_img_request',
    params: {
      type: input.source_processing ? 'img2img' : 'prompt2img'
    }
  })

  const inputToSubmit = { ...input }

  if (input.useFavoriteModels) {
    const favModels = AppSettings.get('favoriteModels') || {}

    const modelsArray =
      Object.keys(favModels).length > 0
        ? (inputToSubmit.models = [...Object.keys(favModels)])
        : ['stable_diffusion']
    input.models = [...modelsArray]
  }

  savePromptHistory(input.prompt)

  if (!AppSettings.get('savePromptOnCreate')) {
    setInput({ prompt: '' })
  }

  logDataForDebugging({
    name: 'index#handle_submit.CreateImageRequest',

    // @ts-ignore
    data: new CreateImageRequest(inputToSubmit)
  })

  console.log(`New Job:`)
  console.log(inputToSubmit)

  // @ts-ignore
  await createImageJob(new CreateImageRequest(inputToSubmit))

  if (!AppSettings.get('stayOnCreate') && !disableRedirect) {
    if (!AppSettings.get('saveInputOnCreate')) {
      resetSavedDrawingState()
    }

    if (!AppSettings.get('saveCanvasOnCreate')) {
      await PromptInputSettings.delete('source_image')
      await PromptInputSettings.delete('source_mask')
    }

    router.push('/pending')
  } else {
    showSuccessToast({ message: 'Image requested!' })
    setPending(false)
  }
}
