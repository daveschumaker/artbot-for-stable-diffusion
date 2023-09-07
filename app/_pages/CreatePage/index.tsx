'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import PageTitle from 'app/_components/PageTitle'
import { loadEditPrompt, SourceProcessing } from 'utils/promptUtils'
import {
  clearCanvasStore,
  getBase64FromDraw,
  getI2IString
} from 'store/canvasStore'
import { getDefaultPrompt } from 'utils/db'
import CreateImageRequest from 'models/CreateImageRequest'
import ShareLinkDetails from 'models/ShareableLink'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import { countImagesToGenerate } from 'utils/imageUtils'
import PromptInputSettings from 'models/PromptInputSettings'
import { userInfoStore } from 'store/userStore'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { logToConsole } from 'utils/debugTools'
import clsx from 'clsx'
import { kudosCostV2 } from 'utils/kudosCost'
import { CreatePageMode } from 'utils/loadInputCache'
import ActionPanel from 'app/_pages/CreatePage/ActionPanel'
import useComponentState from 'hooks/useComponentState'
import { uploadInpaint } from 'controllers/imageDetailsCommon'
import useLockedBody from 'hooks/useLockedBody'
import { handleCreateClick } from './createPage.controller'
import PromptInput from 'app/_pages/CreatePage/PromptInput'
import { CreatePageQueryParams } from 'types/artbot'
import OptionsPanel from 'app/_pages/CreatePage/OptionsPanel'
import FlexRow from 'app/_components/FlexRow'
import CreatePageSettings from './Settings'
import FormErrorMessage from './ActionPanel/FormErrorMessage'
import { useWindowSize } from 'hooks/useWindowSize'
import InputValidationErrorDisplay from './PromptInput/InputValidationErrorDisplay'
import { setAvailableModels } from 'store/modelStore'
import { Button } from 'app/_components/Button'
import { useModal } from '@ebay/nice-modal-react'
import AwesomeModal from 'app/_modules/AwesomeModal'
import TestContent from 'app/_modules/AwesomeModal/TestContent'
import { setAvailableModels } from 'store/modelStore'

const defaultState: DefaultPromptInput = new DefaultPromptInput()

const CreatePage = ({
  availableModels = [],
  className,
  modelDetails = {}
}: any) => {
  const { width } = useWindowSize()
  const appState = useStore(appInfoStore)
  const userInfo = useStore(userInfoStore)
  const testModal = useModal(AwesomeModal)

  const { buildId } = appState
  const { loggedIn } = userInfo

  const [build, setBuild] = useState(buildId)
  const [, setLocked] = useLockedBody(false)
  const [query, setQuery] = useState<CreatePageQueryParams>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  const [pageLoaded, setPageLoaded] = useState(false)
  const [pending, setPending] = useState(false)

  const [errors, setErrors] = useComponentState(
    {} as { [key: string]: boolean }
  )

  const [input, setInput] = useReducer((state: any, newState: any) => {
    const updatedInputState = { ...state, ...newState }

    if (pageLoaded) {
      // Only look for new changes to update and write to localStorage via PromptInputSettings
      // otherwise, cloning the entire input object causes a bunch of CPU thrashing as we iterate
      // through individual keys. If balues haven't changed, there's no need to update them.
      PromptInputSettings.saveAllInput(newState, {
        forceSavePrompt: true
      })

      logToConsole({
        data: newState,
        name: 'setInput_new_state',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    return updatedInputState
  }, new DefaultPromptInput())

  const watchBuild = useCallback(() => {
    if (!build) {
      setBuild(buildId)
      return
    }

    if (buildId !== build) {
      const imageParams = new CreateImageRequest(input)
      // @ts-ignore
      const shareLinkDetails = ShareLinkDetails.encode(imageParams)
      localStorage.setItem('reloadPrompt', shareLinkDetails)
    }
  }, [build, buildId, input])

  const handleSubmit = () => {
    handleCreateClick({
      input,
      pending,
      router,
      setErrors,
      setInput,
      setPending,
      disableRedirect: width && width > 1100
    })
  }

  const resetInput = async () => {
    const defaultPromptResult = (await getDefaultPrompt()) || []
    const [defaultPrompt = {}] = defaultPromptResult

    const newDefaultState = Object.assign({}, defaultState, {
      negative: defaultPrompt.prompt || ''
    })

    clearCanvasStore()
    localStorage.removeItem('img2img_base64')
    setInput(newDefaultState)
  }

  // Various input validation stuff.
  useEffect(() => {
    if (input.source_image && input.tiling) {
      setInput({ tiling: false })
    }
  }, [input.source_image, input.tiling])

  useEffect(() => {
    const hasInpaintingModels = input.models.filter(
      (model: string = '') => model && model.indexOf('_inpainting') >= 0
    ).length
    const hasSourceMask = input.source_mask

    if (
      hasInpaintingModels > 0 &&
      !hasSourceMask &&
      !errors.INPAINT_MISSING_SOURCE_MASK
    ) {
      setErrors({ INPAINT_MISSING_SOURCE_MASK: true })
    } else if (
      (hasInpaintingModels == 0 || hasSourceMask) &&
      errors.INPAINT_MISSING_SOURCE_MASK
    ) {
      setErrors({ INPAINT_MISSING_SOURCE_MASK: false })
    }
  }, [
    errors.INPAINT_MISSING_SOURCE_MASK,
    input.models,
    input.source_mask,
    setErrors
  ])

  useEffect(() => {
    watchBuild()
  }, [watchBuild])

  // DO NOT SET INPUT STUFF until after useEffect runs! Let this function be the sole source of input truth.
  // Check various load states and modes for CreatePage and set preferences based on that here.
  // Thoughts: if we handle all initial input state here, we shouldn't need to track various modes.
  // e.g., anywhere else on the site uses the "savePrompt" method. This simply loads it.
  useEffect(() => {
    // Set initial state here as default. Will act as fallback in case none of the other options work.
    let initialState: DefaultPromptInput | null = new DefaultPromptInput()

    // Step 2. Load user prompt settings, if available
    if (PromptInputSettings.load()) {
      initialState = null
      initialState = { ...PromptInputSettings.load() }

      if (initialState && initialState.source_image) {
        uploadInpaint(initialState, {
          clone: true,
          useSourceImg: true,
          useSourceMask: true
        })
      }

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_2',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 2a. Otherwise, load standard default prompt settings
    if (!PromptInputSettings.load()) {
      initialState = null
      initialState = { ...new DefaultPromptInput() }

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_2a',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 3. Check if drawing mode
    // if (query[CreatePageMode.LOAD_DRAWING] || loadEditPrompt().source_image) {
    if (query[CreatePageMode.LOAD_DRAWING]) {
      initialState = null
      initialState = {
        ...new DefaultPromptInput(),
        source_image: getBase64FromDraw().base64,
        source_processing: SourceProcessing.Img2Img,
        ...(loadEditPrompt() || {}),
        ...(PromptInputSettings.load() || {})
      }

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_3',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4. Validate various prompt parameters (e.g., correct model vs. source_processing type)
    // TODO: Move into subfolder / function?

    // Step 4a.
    if (
      initialState &&
      initialState.models &&
      initialState?.models?.length === 0
    ) {
      initialState.models = ['stable_diffusion']

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4a',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4b.
    if (
      initialState &&
      initialState.models &&
      initialState.models[0] === 'stable_diffusion_2'
    ) {
      initialState.sampler = 'dpmsolver'
      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4b',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4c.
    if (initialState && !initialState.sampler) {
      initialState.sampler = 'k_euler'

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4c',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4d.
    if (
      (initialState &&
        initialState.numImages &&
        isNaN(initialState.numImages)) ||
      (initialState && !initialState.numImages)
    ) {
      initialState.numImages = 1

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4d',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4e.
    // Handle state where tiling is incorrectly set in case of img2img or inpainting
    const hasSourceImageOrMask =
      (initialState && initialState.source_image) ||
      (initialState && initialState.source_mask)
    const hasInvalidModel =
      initialState &&
      initialState.models &&
      initialState.models[0] === 'Stable Diffusion 2 Depth'
    if (
      initialState &&
      (hasSourceImageOrMask || hasInvalidModel) &&
      initialState.tiling === true
    ) {
      initialState.tiling = false
      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4e',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4f. Check if we're restoring an img2img request.
    if (
      initialState?.source_processing === SourceProcessing.Img2Img &&
      getI2IString().base64String
    ) {
      initialState.source_image = getI2IString().base64String
      initialState.height = getI2IString().height
      initialState.width = getI2IString().width

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4f',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4g. Check if we're restoring an img2img or inpainting job
    if (
      (initialState && initialState.source_image && initialState.source_mask) ||
      (initialState &&
        initialState.source_image &&
        initialState.source_processing === SourceProcessing.InPainting)
    ) {
      initialState.source_processing = SourceProcessing.InPainting
    } else if (initialState && initialState.source_image) {
      initialState.source_processing = SourceProcessing.Img2Img
    }

    // Step 5. Check for other query param states.
    // Step 5a. If query param is for loading a model, set model:
    if (initialState && query[CreatePageMode.LOAD_MODEL]) {
      initialState.models = [query[CreatePageMode.LOAD_MODEL] as string]

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_5a',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 5b. If query param is a prompt, set prompt:
    if (initialState && query[CreatePageMode.PROMPT]) {
      initialState.prompt = decodeURIComponent(
        query[CreatePageMode.PROMPT] as string
      )

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_5b',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 6. Load in img2img if not already exists
    if (
      initialState &&
      initialState.source_processing === SourceProcessing.Img2Img &&
      localStorage.getItem('img2img_base64')
    ) {
      initialState.source_image = localStorage.getItem('img2img_base64') || ''

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_6',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 7. Store entirety of modified initial state here
    PromptInputSettings.saveAllInput(initialState as DefaultPromptInput, {
      forceSavePrompt: true
    })

    // Step 8. Set input
    setInput({ ...(initialState as DefaultPromptInput) })
    logToConsole({
      data: initialState,
      name: 'LoadInput_Step_8',
      debugKey: 'DEBUG_LOAD_INPUT'
    })

    // Step 9. Set pageLoaded so we can start error checking and auto saving input.
    setPageLoaded(true)
  }, [query, setLocked])

  useEffect(() => {
    setQuery({
      drawing: searchParams?.get('drawing'),
      i: searchParams?.get('i'),
      model: searchParams?.get('model'),
      prompt: searchParams?.get('prompt')
    })
  }, [searchParams])

  const totalImagesRequested = countImagesToGenerate(input)

  const totalKudosCost = kudosCostV2({
    width: input.width,
    height: input.height,
    steps: input.steps,
    postProcessors: input.post_processing,
    samplerName: input.sampler,
    usesControlNet: input.control_type ? true : false,
    hasSourceImage: input.source_image ? true : false,
    denoisingStrength: input.denoising_strength,
    numImages: totalImagesRequested
  })

  const kudosPerImage =
    totalImagesRequested < 1 ||
    isNaN(totalKudosCost) ||
    isNaN(totalImagesRequested)
      ? 'N/A'
      : Number(totalKudosCost / totalImagesRequested).toFixed(2)

  useEffect(() => {
    setErrors({ FIXED_SEED: Boolean(totalImagesRequested > 1 && input.seed) })
  }, [totalImagesRequested, input.seed, setErrors])

  useEffect(() => {
    // Ensures that available models payload fetched from API on SSR
    // is set to store and made available for consuming components
    setAvailableModels(availableModels)
  }, [availableModels])

  return (
    <main className={className}>
      <div className="flex flex-row items-center w-full">
        <PageTitle>
          Create a new image{' '}
          {input.source_processing === 'outpainting' && '(outpainting)'}
          {input.source_processing === 'inpainting' && '(inpainting)'}
          {input.source_processing === SourceProcessing.Img2Img && '(img2img)'}
        </PageTitle>
      </div>
      <Button
        onClick={() =>
          testModal.show({
            children: <TestContent />,
            label: 'Test Component'
          })
        }
      >
        TEST
      </Button>
      <div className={clsx('mt-0')}>
        <PromptInput input={input} setInput={setInput} />
        <FlexRow>
          <FormErrorMessage errors={errors} />
        </FlexRow>
        <InputValidationErrorDisplay
          input={input}
          modelDetails={modelDetails}
        />
        <FlexRow
          gap={4}
          style={{ alignItems: 'flex-start', position: 'relative' }}
        >
          <CreatePageSettings />

          <ActionPanel
            errors={errors}
            input={input}
            setInput={setInput}
            resetInput={resetInput}
            handleSubmit={handleSubmit}
            pending={pending}
            totalImagesRequested={totalImagesRequested}
            loggedIn={loggedIn}
            totalKudosCost={totalKudosCost}
            kudosPerImage={kudosPerImage}
            showStylesDropdown
          />
        </FlexRow>
      </div>

      <OptionsPanel input={input} setInput={setInput} setErrors={setErrors} />

      <ActionPanel
        errors={errors}
        input={input}
        setInput={setInput}
        resetInput={resetInput}
        handleSubmit={handleSubmit}
        pending={pending}
        totalImagesRequested={totalImagesRequested}
        loggedIn={loggedIn}
        totalKudosCost={totalKudosCost}
        kudosPerImage={kudosPerImage}
      />
    </main>
  )
}

export default CreatePage
