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
import { updateAdEventTimestamp } from 'app/_store/appStore'

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

  updateAdEventTimestamp()
  setPending(true)

  const imageJobData = {
    ...input
  }

  if (getCanvasStore().cached && getCanvasStore().canvasRef) {
    imageJobData.canvasData = { ...getCanvasStore() }
  }

  const inputToSubmit = { ...input }

  // Handle weird error that's been cropping up where canvas is empty but inpainting is true:
  if (
    !input.source_mask &&
    !input.source_image &&
    input.source_processing === SourceProcessing.InPainting
  ) {
    inputToSubmit.source_processing = SourceProcessing.Prompt
    await PromptInputSettings.updateSavedInput_NON_DEBOUNCED({
      ...inputToSubmit
    })
  }

  if (
    !input.source_mask &&
    input.source_image &&
    input.source_processing === SourceProcessing.InPainting
  ) {
    inputToSubmit.source_processing = SourceProcessing.Img2Img
    await PromptInputSettings.updateSavedInput_NON_DEBOUNCED({
      ...inputToSubmit
    })
  }

  if (input.source_mask && !input.source_image) {
    inputToSubmit.source_processing = SourceProcessing.Prompt
    inputToSubmit.source_mask = ''

    await PromptInputSettings.updateSavedInput_NON_DEBOUNCED({
      ...inputToSubmit
    })
  }

  // Silently update PonyXL CLIP if too low:
  if (
    input.models?.[0].toLowerCase().indexOf('pony') !== -1 &&
    inputToSubmit.clipskip === 1
  ) {
    inputToSubmit.clipskip = 2
  }

  if (input.useFavoriteModels) {
    const favModels = AppSettings.get('favoriteModels') || {}

    const modelsArray =
      Object.keys(favModels).length > 0
        ? (inputToSubmit.models = [...Object.keys(favModels)])
        : ['stable_diffusion']
    inputToSubmit.models = [...modelsArray]
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
