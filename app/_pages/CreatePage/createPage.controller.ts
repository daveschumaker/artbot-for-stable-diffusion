import { trackEvent, trackGaEvent } from 'app/_api/telemetry'
import AppSettings from 'app/_data-models/AppSettings'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { Dispatch } from 'react'
import {
  clearCanvasStore,
  getCanvasStore,
  resetSavedDrawingState
} from 'app/_store/canvasStore'
import { clearInputCache, setInputCache } from 'app/_store/inputCache'
import { SetInput } from '_types'
import { logDataForDebugging } from 'app/_utils/debugTools'
import { createImageJob } from 'app/_utils/imageCache'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import {
  SourceProcessing,
  clearSavedInputCache,
  savePromptHistory
} from 'app/_utils/promptUtils'

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
    !getCanvasStore().canvasRef &&
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
    PromptInputSettings.set('prompt', '')
  }

  clearSavedInputCache()
  logDataForDebugging({
    name: 'index#handle_submit.CreateImageRequest',

    // @ts-ignore
    data: new CreateImageRequest(inputToSubmit)
  })

  // @ts-ignore
  await createImageJob(new CreateImageRequest(inputToSubmit))

  // Store parameters for potentially restoring inpainting data if needed
  let inpaintCache = {
    orientationType: input.orientationType,
    height: input.height,
    width: input.width,
    source_processing: input.source_processing,
    source_image: input.source_image,
    source_mask: input.source_mask
  }

  if (!AppSettings.get('stayOnCreate') && !disableRedirect) {
    if (!AppSettings.get('saveInputOnCreate')) {
      resetSavedDrawingState()
      clearInputCache()
    }

    if (!AppSettings.get('saveCanvasOnCreate')) {
      clearCanvasStore()
    } else {
      setInputCache({ ...inpaintCache })
    }

    router.push('/pending')
  } else {
    if (AppSettings.get('saveCanvasOnCreate')) {
      setInput({ ...inpaintCache })
    }

    showSuccessToast({ message: 'Image requested!' })
    setPending(false)
  }
}
