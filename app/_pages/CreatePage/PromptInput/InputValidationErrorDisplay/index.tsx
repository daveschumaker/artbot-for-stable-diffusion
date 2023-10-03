import { MAX_IMAGE_PIXELS } from '_constants'
import FlexCol from 'app/_components/FlexCol'
import AppSettings from 'app/_data-models/AppSettings'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import {
  promptSafetyExclusions,
  validatePromptSafety
} from 'app/_utils/validationUtils'
import { IconAlertTriangle } from '@tabler/icons-react'

const RenderError = ({ msg }: { msg: string | boolean }) => {
  if (!msg) return null

  return (
    <div
      className="rounded-md px-4 py-2 font-[500] flex flex-row items-center gap-2"
      style={{
        border: '1px solid rgb(239, 68, 68)',
        color: 'rgb(239 68 68)',
        fontSize: '12px'
      }}
    >
      <div>
        <IconAlertTriangle size={38} />
      </div>
      <div>{msg}</div>
    </div>
  )
}

export default function InputValidationErrorDisplay({
  input,
  modelDetails = {}
}: {
  input: DefaultPromptInput
  modelDetails: any
}) {
  // const { modelDetails } = useStore(modelStore)
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [imageError, setImageError] = useState<boolean | string>(false)
  const [sdxlBetaError, setSdxlBetaError] = useState<boolean | string>(false)
  const [sdxlError, setSdxlError] = useState<boolean | string>(false)
  const [flaggedPromptError, setFlaggedPromptError] = useState<
    boolean | string
  >(false)
  const [promptReplacementError, setPromptReplacementError] =
    useState<boolean>(false)

  // Image dimensions
  useEffect(() => {
    let hasError = false

    const pixels = input.height * input.width
    if (pixels > MAX_IMAGE_PIXELS) {
      hasError = true
      setImageError(
        `Error: Please adjust image resolution before submitting this request. ${
          input.width
        }w x ${
          input.height
        }h (${pixels.toLocaleString()} px) is more than the max supported value: ${MAX_IMAGE_PIXELS.toLocaleString()} px`
      )
    }

    if (imageError && !hasError) {
      setImageError(false)
    }
  }, [imageError, input.height, input.width])

  // SDXL Beta
  useEffect(() => {
    const filteredBetaModels = input.models.filter((model) => {
      if (
        modelDetails[model] &&
        modelDetails[model].baseline === 'stable_diffusion_xl'
      ) {
        return true
      }
    })

    const hasSdxlBeta = filteredBetaModels.length > 0
    let hasError = false

    if (hasSdxlBeta && input.post_processing.length > 0) {
      hasError = true
      setSdxlBetaError(
        'SDXL_beta Error: Unable to use post processors with SDXL beta workers. Please remove them in order to continue.'
      )
    }

    if (
      (!hasSdxlBeta && sdxlBetaError) ||
      (hasSdxlBeta && !hasError && sdxlBetaError)
    ) {
      setSdxlBetaError(false)
    }
  }, [
    input.models,
    input.post_processing.length,
    loggedIn,
    modelDetails,
    sdxlBetaError
  ])

  // SDXL
  useEffect(() => {
    const filteredModels = input.models.filter((model) =>
      model.toLowerCase().includes('sdxl')
    )
    const hasSdxl = filteredModels.length > 0
    let hasError = false

    if (hasSdxl) {
      if (input.loras.length > 0) {
        hasError = true
        setSdxlError(
          'SDXL Error: Currently unable to use LoRAs with SDXL image models. Please remove LoRAs in order to continue.'
        )
      }

      if (input.hires) {
        hasError = true
        setSdxlError(
          'SDXL Error: Currently unable to use hi-res fix with SDXL image models. Please disable hi-res fix in order to continue.'
        )
      }

      if (input.control_type) {
        hasError = true
        setSdxlError(
          'SDXL Error: Currently unable to use ControlNet with SDXL image models. Please disable ControlNet in order to continue.'
        )
      }

      if (input.source_mask) {
        hasError = true
        setSdxlError(
          'SDXL Error: Currently unable to use inpainting with SDXL image models. Please remove the inpainting mask in order to continue.'
        )
      }

      // const minPixels = 983040
      // const pixels = input.height * input.width
      if (input.width < 1024 && input.height < 1024) {
        hasError = true
        setSdxlError(
          `SDXL Error: Please adjust image resolution so that one side is at least 1024 px. Current size: ${input.width}w x ${input.height}`
        )
      }
    }

    if ((!hasSdxl && sdxlError) || (hasSdxl && !hasError && sdxlError)) {
      setSdxlError(false)
    }
  }, [
    input.control_type,
    input.height,
    input.hires,
    input.loras.length,
    input.models,
    input.source_mask,
    input.width,
    sdxlError
  ])

  // Flagged content
  useEffect(() => {
    const modifiedPrompt = promptSafetyExclusions(input.prompt, input.models[0])
    const promptFlagged = validatePromptSafety(modifiedPrompt)
    const hasNsfwModel =
      input?.models?.filter((model: string) => {
        if (!model) {
          return false
        }

        return modelDetails[model] && modelDetails[model].nsfw === true
      }) || []

    const promptReplacement =
      AppSettings.get('useReplacementFilter') !== false &&
      input.prompt.length < 1000

    if (
      !promptReplacement &&
      promptFlagged &&
      !flaggedPromptError &&
      hasNsfwModel.length > 0
    ) {
      setFlaggedPromptError(
        `You are about to send a prompt that likely violates the Stable Horde terms of use and may be rejected by the API. Please edit your prompt, choose a non-NSFW model, or enable the prompt replacement filter and try again.`
      )
    }
    if ((!promptFlagged && flaggedPromptError) || hasNsfwModel.length === 0) {
      setFlaggedPromptError(false)
    }
  }, [flaggedPromptError, input.models, input.prompt, modelDetails])

  // Replacement filter
  useEffect(() => {
    if (
      input.prompt.length >= 1000 &&
      AppSettings.get('useReplacementFilter') !== false
    ) {
      setPromptReplacementError(true)
    } else if (input.prompt.length < 1000 && promptReplacementError) {
      setPromptReplacementError(false)
    }
  }, [input.prompt.length, promptReplacementError])

  if (
    !promptReplacementError &&
    !flaggedPromptError &&
    !sdxlError &&
    !sdxlBetaError &&
    !imageError
  ) {
    return null
  }

  return (
    <FlexCol gap={8} style={{ marginTop: '8px' }}>
      {imageError && <RenderError msg={imageError} />}
      {sdxlBetaError && <RenderError msg={sdxlBetaError} />}
      {sdxlError && <RenderError msg={sdxlError} />}
      {promptReplacementError && <RenderError msg={promptReplacementError} />}
      {flaggedPromptError && <RenderError msg={flaggedPromptError} />}
    </FlexCol>
  )
}
