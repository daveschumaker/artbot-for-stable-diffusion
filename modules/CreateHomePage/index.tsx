/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import { useRouter } from 'next/router'

import PageTitle from '../../components/UI/PageTitle'
import { loadEditPrompt, SourceProcessing } from '../../utils/promptUtils'
import OptionsPanel from '../../components/CreatePage/OptionsPanel'
import {
  clearCanvasStore,
  getBase64FromDraw,
  getI2IString
} from '../../store/canvasStore'
import { getDefaultPrompt } from '../../utils/db'
import CreateImageRequest from '../../models/CreateImageRequest'
import ShareLinkDetails from '../../models/ShareableLink'
import Head from 'next/head'
import { useStore } from 'statery'
import { appInfoStore } from '../../store/appStore'
import { countImagesToGenerate } from '../../utils/imageUtils'
import PromptInputSettings from '../../models/PromptInputSettings'
import { userInfoStore } from '../../store/userStore'
import TriggerDropdown from '../../components/CreatePage/TriggerDropdown'
import DefaultPromptInput from '../../models/DefaultPromptInput'
import { logToConsole } from '../../utils/debugTools'
import {
  promptSafetyExclusions,
  validatePromptSafety
} from '../../utils/validationUtils'
import AlertTriangleIcon from '../../components/icons/AlertTriangle'
import clsx from 'clsx'
import { kudosCostV2 } from '../../utils/kudosCost'
import { CreatePageMode, isSharedLink } from '../../utils/loadInputCache'
import ActionPanel from '../../components/CreatePage/ActionPanel'
import useComponentState from 'hooks/useComponentState'
import { uploadInpaint } from 'controllers/imageDetailsCommon'
import useLockedBody from 'hooks/useLockedBody'
import { handleCreateClick } from './createPage.controller'
import ShareModal from './ShareModal'
import PromptInput from './PromptInput'

const defaultState: DefaultPromptInput = new DefaultPromptInput()

const CreateHomePage = ({ modelDetails = {}, shortlinkImageParams }: any) => {
  const appState = useStore(appInfoStore)
  const userInfo = useStore(userInfoStore)

  const { buildId } = appState
  const { loggedIn } = userInfo

  const [build, setBuild] = useState(buildId)

  const [, setLocked] = useLockedBody(false)
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

  const handleSubmit = () => {
    handleCreateClick({
      input,
      pending,
      router,
      setErrors,
      setInput,
      setPending
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
  }, [query, setLocked, shortlinkImageParams])

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
        <ShareModal
          handleCloseModal={() => {
            setLocked(false)
            setShowSharedModal(false)
          }}
          query={query}
          setInput={setInput}
          shortlinkImageParams={shortlinkImageParams}
        />
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
            content={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${
              query[CreatePageMode.SHORTLINK]
            }.webp`}
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
      <div className={clsx('mt-0')}>
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

        <PromptInput input={input} setInput={setInput} />

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

export default CreateHomePage
