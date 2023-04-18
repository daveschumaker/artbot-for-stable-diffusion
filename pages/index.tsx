/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import { createImageJob } from '../utils/imageCache'
import PageTitle from '../components/UI/PageTitle'
import {
  clearSavedInputCache,
  loadEditPrompt,
  savePromptHistory,
  SourceProcessing
} from '../utils/promptUtils'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import OptionsPanel from '../components/CreatePage/OptionsPanel'
import {
  clearCanvasStore,
  getBase64FromDraw,
  getCanvasStore,
  getI2IString,
  resetSavedDrawingState
} from '../store/canvasStore'
import { clearInputCache, setInputCache } from '../store/inputCache'
import { getDefaultPrompt } from '../utils/db'
import CreateImageRequest from '../models/CreateImageRequest'
import ShareLinkDetails from '../models/ShareableLink'
import Head from 'next/head'
import { useStore } from 'statery'
import { appInfoStore } from '../store/appStore'
import AppSettings from '../models/AppSettings'
import { countImagesToGenerate } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import InteractiveModal from '../components/UI/InteractiveModal/interactiveModal'
import PromptInputSettings from '../models/PromptInputSettings'
import { userInfoStore } from '../store/userStore'
import styles from '../styles/index.module.css'
import TriggerDropdown from '../components/CreatePage/TriggerDropdown'
import DefaultPromptInput from '../models/DefaultPromptInput'
import { logDataForDebugging, logToConsole } from '../utils/debugTools'
import {
  promptSafetyExclusions,
  validatePromptSafety
} from '../utils/validationUtils'
import AlertTriangleIcon from '../components/icons/AlertTriangle'
import clsx from 'clsx'
import { kudosCostV2 } from '../utils/kudosCost'
import { CreatePageMode, isSharedLink } from '../utils/loadInputCache'
import ImageApiParamsToPromptInput from '../models/ImageApiParamsToPromptInput'
import ActionPanel from '../components/CreatePage/ActionPanel'
import useComponentState from 'hooks/useComponentState'
import { uploadInpaint } from 'controllers/imageDetailsCommon'
import { lockScroll, unlockScroll } from 'utils/appUtils'
import NegativePrompt from 'components/CreatePage/NegativePrompt'
import PromptText from 'components/CreatePage/AdvancedOptionsPanel/PromptText'

interface InputTarget {
  name: string
  value: string
}
interface InputEvent {
  target: InputTarget
}

const defaultState: DefaultPromptInput = new DefaultPromptInput()

export async function getServerSideProps(context: any) {
  let availableModels: Array<any> = []
  let modelDetails: any = {}
  let shortlinkImageParams: any = ''

  const { query } = context
  const { i } = query

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/details`
    )
    const modelDetailsData = (await modelDetailsRes.json()) || {}
    modelDetails = modelDetailsData.models

    if (i) {
      const res = await fetch(
        `http://localhost:${process.env.PORT}/artbot/api/get-shortlink?shortlink=${query.i}`
      )

      const data = (await res.json()) || {}
      const { imageParams } = data.imageParams || {}
      shortlinkImageParams = imageParams || null
    }
  } catch (err) {}

  return {
    props: {
      availableModels,
      modelDetails,
      shortlinkImageParams
    }
  }
}

const Home: NextPage = ({ modelDetails, shortlinkImageParams }: any) => {
  const appState = useStore(appInfoStore)
  const userInfo = useStore(userInfoStore)

  const { buildId } = appState
  const { loggedIn } = userInfo

  const [build, setBuild] = useState(buildId)

  const router = useRouter()
  const { query } = router

  const [pageLoaded, setPageLoaded] = useState(false)
  const [flaggedPromptError, setFlaggedPromptError] = useState(false)
  const [pending, setPending] = useState(false)
  const [showSharedModal, setShowSharedModal] = useState(false)

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
        data: updatedInputState,
        name: 'setInput_state',
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

  const handleChangeValue = (event: InputEvent) => {
    const inputName = event.target.name
    const inputValue = event.target.value

    setInput({ [inputName]: inputValue })
  }

  const handleSubmit = async () => {
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
          : 'stable_diffusion'
      input.models = [...modelsArray]
    }

    savePromptHistory(input.prompt)

    if (!AppSettings.get('savePromptOnCreate')) {
      PromptInputSettings.set('prompt', '')
    }

    clearSavedInputCache()
    logDataForDebugging({
      name: 'index#handle_submit.CreateImageRequest',
      data: new CreateImageRequest(inputToSubmit)
    })

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
    const modifiedPrompt = promptSafetyExclusions(input.prompt, input.models[0])
    const promptFlagged = validatePromptSafety(modifiedPrompt)
    const hasNsfwModel =
      input?.models?.filter((model: string) => {
        if (!model) {
          return false
        }

        return modelDetails[model] && modelDetails[model].nsfw === true
      }) || []

    if (promptFlagged && !flaggedPromptError && hasNsfwModel.length > 0) {
      setFlaggedPromptError(true)
    }
    if ((!promptFlagged && flaggedPromptError) || hasNsfwModel.length === 0) {
      setFlaggedPromptError(false)
    }

    if (input.source_image && input.tiling) {
      setInput({ tiling: false })
    }
  }, [
    input.prompt,
    input.models,
    flaggedPromptError,
    modelDetails,
    input.source_image,
    input.tiling
  ])

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

    // Step 1. Check if prompt is shared via original share parameter.
    if (isSharedLink(query) && query[CreatePageMode.SHARE]) {
      initialState = null
      const shareParams =
        ShareLinkDetails.decode(query[CreatePageMode.SHARE] as string) || {}

      // @ts-ignore
      initialState = { ...shareParams }

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_1',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 1a. Check if prompt is shared via shortlink service.
    if (
      isSharedLink(query) &&
      query[CreatePageMode.SHORTLINK] &&
      shortlinkImageParams
    ) {
      initialState = null
      // TODO: Function to map shortlinkImageParams to regular object. Make it testable!
      // @ts-ignore
      initialState = new ImageApiParamsToPromptInput(shortlinkImageParams)
      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_1a',
        debugKey: 'DEBUG_LOAD_INPUT'
      })

      lockScroll()
      setShowSharedModal(true)
    }

    // Step 2. Load user prompt settings, if available
    if (!isSharedLink(query) && PromptInputSettings.load()) {
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
    if (!isSharedLink(query) && !PromptInputSettings.load()) {
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

    // Step 9. Set pageLoaded so we can start error checking and auto saving input.
    setPageLoaded(true)
  }, [query, shortlinkImageParams])

  let sharedPrompt
  if (query[CreatePageMode.SHARE]) {
    sharedPrompt = ShareLinkDetails.decode(
      query[CreatePageMode.SHARE] as string
    ).prompt
  }

  const triggerArray = [...(modelDetails[input?.models[0]]?.trigger ?? '')]
  const totalImagesRequested = countImagesToGenerate(input)

  const totalKudosCost = kudosCostV2({
    width: input.width,
    height: input.height,
    steps: input.steps,
    postProcessors: input.post_processing,
    samplerName: input.sampler,
    usesControlNet: input.control_type ? true : false,
    prompt: [input.prompt, input.negative].join(' ### '),
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

  return (
    <main className="pb-[90px]">
      {showSharedModal && (
        <InteractiveModal
          handleClose={() => {
            unlockScroll()
            setShowSharedModal(false)
          }}
          maxWidth="480px"
        >
          <div className="flex flex-col w-full px-3">
            <PageTitle>Shared image</PageTitle>
            <div className="flex justify-center w-full">
              <img
                src={`https://tinybots.net/artbot/api/v1/shortlink/i/${
                  query[CreatePageMode.SHORTLINK]
                }`}
                alt=""
                className="max-h-[256px]"
              />
            </div>
            <div className="flex justify-center w-full px-2 mt-4 italic">
              {input.prompt}
            </div>
            <div
              className="mt-4 mb-2 w-full flex px-2 justify-center text-[#14b8a5] cursor-pointer font-[700]"
              onClick={() => {
                unlockScroll()
                setShowSharedModal(false)
              }}
            >
              Create your own image
            </div>
          </div>
        </InteractiveModal>
      )}
      {shortlinkImageParams && shortlinkImageParams.params ? (
        <Head>
          <title>
            🤖 ArtBot - Shareable Link
            {shortlinkImageParams.models && shortlinkImageParams.models[0]
              ? ` created with ${shortlinkImageParams.models[0]}`
              : ''}
          </title>
          <meta
            name="twitter:title"
            content={`🤖 ArtBot - Shareable Link ${
              shortlinkImageParams.models && shortlinkImageParams.models[0]
                ? `created with ${shortlinkImageParams.models[0]}`
                : ''
            }`}
          />
          <meta
            name="twitter:description"
            content={`Prompt: "${shortlinkImageParams.prompt}"`}
          />
          <meta
            name="twitter:image"
            content={`https://tinybots.net/artbot/api/v1/shortlink/i/${
              query[CreatePageMode.SHORTLINK]
            }`}
          />
        </Head>
      ) : null}
      {query[CreatePageMode.SHARE] ? (
        <Head>
          <title>ArtBot - Shareable Link</title>
          <meta name="twitter:title" content="ArtBot - Shareable Link" />
          <meta
            name="twitter:description"
            content={`Prompt: "${sharedPrompt}"`}
          />
        </Head>
      ) : null}
      <div className="flex flex-row items-center w-full">
        <div className="inline-block w-1/2">
          <PageTitle>
            New image{' '}
            {input.source_processing === 'outpainting' && '(outpainting)'}
            {input.source_processing === 'inpainting' && '(inpainting)'}
            {input.source_processing === SourceProcessing.Img2Img &&
              '(img2img)'}
          </PageTitle>
        </div>
      </div>
      {modelDetails[input?.models[0]]?.trigger && (
        <TriggerDropdown
          setInput={setInput}
          prompt={input.prompt}
          triggerArray={triggerArray}
        />
      )}
      <div className={clsx(styles['sticky-text-area'], 'mt-0')}>
        {flaggedPromptError && (
          <div className="mb-4 bg-red-500 rounded-md px-4 py-2 font-[500] flex flex-row items-center gap-2 text-white">
            <div>
              <AlertTriangleIcon size={38} />
            </div>
            <div>
              You are about to send a prompt that likely violates the Stable
              Horde terms of use and may be rejected by the API. Please edit
              your prompt or choose a non-NSFW model and try again.
            </div>
          </div>
        )}

        <PromptText
          handleChangeValue={handleChangeValue}
          input={input}
          setInput={setInput}
        />

        <NegativePrompt
          handleChangeValue={handleChangeValue}
          input={input}
          setInput={setInput}
        />

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
      </div>

      <OptionsPanel input={input} setInput={setInput} />

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

export default Home
