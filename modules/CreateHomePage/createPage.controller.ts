import { trackEvent, trackGaEvent } from 'api/telemetry'
import AppSettings from 'models/AppSettings'
import CreateImageRequest from 'models/CreateImageRequest'
import DefaultPromptInput from 'models/DefaultPromptInput'
import PromptInputSettings from 'models/PromptInputSettings'
import { Dispatch } from 'react'
import { toast } from 'react-toastify'
import {
  clearCanvasStore,
  getCanvasStore,
  resetSavedDrawingState
} from 'store/canvasStore'
import { clearInputCache, setInputCache } from 'store/inputCache'
import { SetInput } from 'types'
import { logDataForDebugging } from 'utils/debugTools'
import { createImageJob } from 'utils/imageCache'
import {
  SourceProcessing,
  clearSavedInputCache,
  savePromptHistory
} from 'utils/promptUtils'

interface CreateClick {
  pending: boolean
  input: DefaultPromptInput
  setPending: Dispatch<boolean>
  setErrors: Dispatch<any>
  setInput: SetInput
  router: any
}

export const handleCreateClick = async ({
  pending,
  input,
  setPending,
  setErrors,
  setInput,
  router
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
      type: input.img2img ? 'img2img' : 'prompt2img'
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

  if (!AppSettings.get('stayOnCreate')) {
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

    toast.success('Image requested!', {
      pauseOnFocusLoss: false,
      position: 'top-center',
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'light'
    })
    setPending(false)
  }
}
