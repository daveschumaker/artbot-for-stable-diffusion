/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
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
import TextArea from '../components/UI/TextArea'
import { Button } from '../components/UI/Button'
import { trackEvent, trackGaEvent } from '../api/telemetry'
import OptionsPanel from '../components/CreatePage/OptionsPanel'
import {
  clearCanvasStore,
  getBase64FromDraw,
  getCanvasStore,
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
import { countImagesToGenerate, orientationDetails } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import InteractiveModal from '../components/UI/InteractiveModal/interactiveModal'
import PromptHistory from '../components/PromptHistory'
import MenuButton from '../components/UI/MenuButton'
import HistoryIcon from '../components/icons/HistoryIcon'
import PromptInputSettings from '../models/PromptInputSettings'
import { userInfoStore } from '../store/userStore'
import styles from '../styles/index.module.css'
import TriggerDropdown from '../components/CreatePage/TriggerDropdown'
import DefaultPromptInput from '../models/DefaultPromptInput'
import { logDataForDebugging } from '../utils/debugTools'
import {
  promptSafetyExclusions,
  validatePromptSafety
} from '../utils/validationUtils'
import AlertTriangleIcon from '../components/icons/AlertTriangle'
import FlexRow from '../components/UI/FlexRow'
import ArrowBarLeftIcon from '../components/icons/ArrowBarLeftIcon'
import clsx from 'clsx'
import { kudosCostV2 } from '../utils/kudosCost'
import { CreatePageMode, isSharedLink } from '../utils/loadInputCache'
import ImageApiParamsToPromptInput from '../models/ImageApiParamsToPromptInput'
import ActionPanel from '../components/CreatePage/ActionPanel'

interface InputTarget {
  name: string
  value: string
}
interface InputEvent {
  target: InputTarget
}

const defaultState: DefaultPromptInput = new DefaultPromptInput()

const ERROR_INPAINT_MISSING_SOURCE_MASK =
  "Whoa! You need an image and a source mask first before continuing. Please upload an image and add paint an area you'd like to change, or change your model before continuing."

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

  const ref = useRef(null)
  const [build, setBuild] = useState(buildId)

  const router = useRouter()
  const { query } = router

  const [pageLoaded, setPageLoaded] = useState(false)
  const [flaggedPromptError, setFlaggedPromptError] = useState(false)
  const [showPromptHistory, setShowPromptHistory] = useState(false)
  const [hasValidationError, setHasValidationError] = useState(false)
  const [pending, setPending] = useState(false)
  const [hasError, setHasError] = useState('')
  const [input, setInput] = useReducer((state: any, newState: any) => {
    const updatedInputState = { ...state, ...newState }

    if (pageLoaded) {
      PromptInputSettings.saveAllInput(updatedInputState, {
        forceSavePrompt: true
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

  const handleImageUpload = (imageType: string, source_image: string) => {
    setInput({
      img2img: true,
      imageType,
      source_image
    })
  }

  const handleOrientationSelect = (orientation: string, options?: any) => {
    const details = orientationDetails(orientation, input.height, input.width)

    setInput({
      orientationType: orientation,
      height: details.height,
      width: details.width
    })

    if (!options?.initLoad) {
      trackEvent({
        event: 'ORIENTATION_CLICK',
        context: '/pages/index',
        data: {
          orientation
        }
      })
    }
  }

  const handleSubmit = async () => {
    // TODO: Rather than directly send to API, we should queue up
    // jobs so we only ever send one job at a time to the API?

    if (hasValidationError || pending) {
      return
    }

    setPending(true)

    if (!input?.prompt || input?.prompt.trim() === '') {
      setHasError('Please enter a prompt to continue.')
      setPending(false)
      return
    }

    const imageJobData = {
      ...input
    }

    if (getCanvasStore().cached && getCanvasStore().canvasRef) {
      imageJobData.canvasStore = { ...getCanvasStore() }
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

    //////// TODO: REMOVE ME when kudos debugging is complete:
    const kudos = kudosCostV2({
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

    logDataForDebugging({
      name: 'index#handle_submit.PredictedKudosCost',
      data: {
        totalCalculatedKudos: kudos,
        totalImagesRequested: countImagesToGenerate(input),
        width: input.width,
        height: input.height,
        steps: input.steps,
        numImages: totalImagesRequested,
        postProcessors: input.post_processing,
        sampler: input.sampler,
        control_type: input.source_image ? input.control_type : '',
        prompt: input.prompt,
        negativePrompt: input.negative
      }
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
    setInput(newDefaultState)
  }

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
  }, [input.prompt, input.models, flaggedPromptError, modelDetails])

  useEffect(() => {
    const hasInpaintingModels =
      input.models.filter((model: string) => {
        return model.indexOf('_inpainting') >= 0
      }) || []
    const hasSourceMask = input.source_mask

    if (
      hasInpaintingModels.length > 0 &&
      !hasSourceMask &&
      hasError !== ERROR_INPAINT_MISSING_SOURCE_MASK
    ) {
      setHasError(ERROR_INPAINT_MISSING_SOURCE_MASK)
    } else if (
      hasInpaintingModels.length > 0 &&
      hasSourceMask &&
      hasError === ERROR_INPAINT_MISSING_SOURCE_MASK
    ) {
      setHasError('')
    } else if (
      hasInpaintingModels.length === 0 &&
      hasError === ERROR_INPAINT_MISSING_SOURCE_MASK
    ) {
      setHasError('')
    }
  }, [hasError, input.models, input.source_mask])

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
    }

    // Step 2. Load user prompt settings, if available
    if (!isSharedLink(query) && PromptInputSettings.load()) {
      initialState = null
      initialState = { ...PromptInputSettings.load() }
    }

    // Step 2a. Otherwise, load standarddefault prompt settings
    if (!isSharedLink(query) && !PromptInputSettings.load()) {
      initialState = null
      initialState = { ...new DefaultPromptInput() }
    }

    // Step 3. Check for other query param states. If query param is for loading a model, set model:
    if (query[CreatePageMode.LOAD_MODEL]) {
      initialState = null
      initialState = {
        ...new DefaultPromptInput(),
        ...(PromptInputSettings.load() || {}),
        models: [query[CreatePageMode.LOAD_MODEL] as string]
      }
    }

    // Step 3a. Check if drawing mode
    if (query[CreatePageMode.LOAD_DRAWING] || loadEditPrompt().source_image) {
      initialState = null
      initialState = {
        ...new DefaultPromptInput(),
        source_image: getBase64FromDraw().base64,
        source_processing: SourceProcessing.Img2Img,
        ...(loadEditPrompt() || {})
      }
    }

    // Step 4. Validate various prompt parameters (e.g., correct model vs. source_processing type)
    // TODO: Move into subfolder / function?

    if (
      initialState &&
      initialState.models &&
      initialState?.models?.length === 0
    ) {
      initialState.models = ['stable_diffusion']
    }

    if (
      initialState &&
      initialState.models &&
      initialState.models[0] === 'stable_diffusion_2'
    ) {
      initialState.sampler = 'dpmsolver'
    }

    if (initialState && !initialState.sampler) {
      initialState.sampler = 'k_euler'
    }

    if (
      (initialState &&
        initialState.numImages &&
        isNaN(initialState.numImages)) ||
      (initialState && !initialState.numImages)
    ) {
      initialState.numImages = 1
    }

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
    }

    // Step 4. Set input
    setInput({ ...initialState })

    // Step 5. Set pageLoaded so we can start error checking and auto saving input.
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

  const fixedSeedErrorMsg =
    'Warning: You are using a fixed seed with multiple images. (You can still continue)'
  if (
    hasError !== fixedSeedErrorMsg &&
    totalImagesRequested > 1 &&
    input.seed
  ) {
    setHasError(fixedSeedErrorMsg)
  } else if (
    hasError === fixedSeedErrorMsg &&
    (!input.seed || totalImagesRequested === 1)
  ) {
    setHasError('')
  }

  return (
    <main>
      {showPromptHistory && (
        <InteractiveModal handleClose={() => setShowPromptHistory(false)}>
          <PromptHistory
            copyPrompt={setInput}
            handleClose={() => setShowPromptHistory(false)}
          />
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
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          <PageTitle>
            New image{' '}
            {input.source_processing === 'outpainting' && '(outpainting)'}
            {input.source_processing === 'inpainting' && '(inpainting)'}
            {input.source_processing === SourceProcessing.Img2Img &&
              '(img2img)'}
          </PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <MenuButton
            active={showPromptHistory}
            title=""
            onClick={() => {
              setShowPromptHistory(true)
            }}
          >
            <HistoryIcon size={24} />
          </MenuButton>
        </div>
      </div>
      {modelDetails[input?.models[0]]?.trigger && (
        <TriggerDropdown
          setInput={setInput}
          prompt={input.prompt}
          triggerArray={triggerArray}
        />
      )}
      <div className={clsx(styles['sticky-text-area'], 'mt-2')}>
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
        <FlexRow>
          <TextArea
            name="prompt"
            placeholder="Describe your image..."
            onChange={handleChangeValue}
            value={input.prompt}
            ref={ref}
          />
          <Button
            title="Clear current input"
            btnType="secondary"
            onClick={() => {
              PromptInputSettings.set('prompt', '')
              setInput({
                prompt: ''
              })
            }}
          >
            <ArrowBarLeftIcon />
          </Button>
        </FlexRow>

        <ActionPanel
          hasValidationError={hasValidationError}
          hasError={hasError}
          fixedSeedErrorMsg={fixedSeedErrorMsg}
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
      <OptionsPanel
        handleChangeInput={handleChangeValue}
        handleImageUpload={handleImageUpload}
        handleOrientationSelect={handleOrientationSelect}
        input={input}
        setInput={setInput}
        setHasValidationError={setHasValidationError}
      />

      <ActionPanel
        hasValidationError={hasValidationError}
        hasError={hasError}
        fixedSeedErrorMsg={fixedSeedErrorMsg}
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
