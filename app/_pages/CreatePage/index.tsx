'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import PageTitle from 'app/_components/PageTitle'
import { loadEditPrompt, SourceProcessing } from 'app/_utils/promptUtils'
import { getBase64FromDraw } from 'app/_store/canvasStore'
import { getDefaultPrompt } from 'app/_utils/db'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import ShareLinkDetails from 'app/_data-models/ShareableLink'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import { countImagesToGenerate } from 'app/_utils/imageUtils'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { userInfoStore } from 'app/_store/userStore'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { logToConsole } from 'app/_utils/debugTools'
import clsx from 'clsx'
import { kudosCostV2 } from 'app/_utils/kudosCost'
import { CreatePageMode } from 'app/_utils/loadInputCache'
import ActionPanel from 'app/_pages/CreatePage/ActionPanel'
import useComponentState from 'app/_hooks/useComponentState'
import { uploadInpaint } from 'app/_controllers/imageDetailsCommon'
import { handleCreateClick } from './createPage.controller'
import PromptInput from 'app/_pages/CreatePage/PromptInput'
import { CreatePageQueryParams } from '_types/artbot'
import OptionsPanel from 'app/_pages/CreatePage/OptionsPanel'
import FlexRow from 'app/_components/FlexRow'
import CreatePageSettings from './Settings'
import FormErrorMessage from './ActionPanel/FormErrorMessage'
import { useWindowSize } from 'app/_hooks/useWindowSize'
import InputValidationErrorDisplay from './PromptInput/InputValidationErrorDisplay'
import { modelStore } from 'app/_store/modelStore'
import { useInput } from 'app/_modules/InputProvider/context'
import MaxWidth from 'app/_components/MaxWidth'
import styles from './createPage.module.css'
import { Button } from 'app/_components/Button'
import { IconAlertTriangle, IconArrowBarToUp } from '@tabler/icons-react'
import TooltipComponent from 'app/_components/TooltipComponent'
import { CREATE_PAGE_PARAM } from '_constants'

const defaultState: DefaultPromptInput = new DefaultPromptInput()

const CreatePage = ({ className }: any) => {
  const [actionPanelVisible, setActionPanelVisible] = useState(true)
  const actionPanelRef = useRef<HTMLDivElement>(null)
  const [hasError, setHasError] = useState(false)

  const { input, setInput, setPageLoaded } = useInput()
  const { modelDetails } = useStore(modelStore)
  const { width } = useWindowSize()
  const appState = useStore(appInfoStore)
  const userInfo = useStore(userInfoStore)

  const { buildId } = appState
  const { loggedIn } = userInfo

  const [build, setBuild] = useState(buildId)
  const [query, setQuery] = useState<CreatePageQueryParams>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  const [pending, setPending] = useState(false)

  const [errors, setErrors] = useComponentState(
    {} as { [key: string]: boolean }
  )

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

    localStorage.removeItem('img2img_base64')
    setInput(newDefaultState)
  }

  // Various input validation stuff.
  useEffect(() => {
    if (input.source_image && input.tiling) {
      setInput({ tiling: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateLocalStorate = async () => {
    const data = localStorage.getItem('PromptInputSettings')

    if (data) {
      try {
        const json = JSON.parse(data)
        delete json.canvasData
        delete json.canvasStore
        delete json.maskData

        const input = new DefaultPromptInput()

        for (const key in json) {
          if (json.hasOwnProperty(key) && input.hasOwnProperty(key)) {
            // @ts-ignore
            input[key] = json[key]
          }
        }

        await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(input)
        localStorage.removeItem('PromptInputSettings')
      } catch (err) {
        console.log(`Error occurred while migrating PromptInputSettings`, err)
      }
    }
  }

  const handleInitLoad = useCallback(async () => {
    await updateLocalStorate()

    // Set initial state here as default. Will act as fallback in case none of the other options work.
    let initialState: DefaultPromptInput | null = new DefaultPromptInput()

    // Step 1. Load user prompt settings, if available
    const promptInput = await PromptInputSettings.load()

    initialState = { ...promptInput } as DefaultPromptInput

    if (initialState && initialState.source_image) {
      uploadInpaint(initialState, {
        clone: true,
        useSourceImg: true,
        useSourceMask: true
      })
    }

    // Step 2. Check if drawing mode
    if (query[CreatePageMode.LOAD_DRAWING]) {
      initialState = null
      // @ts-ignore
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

    // Step 3. Validate various prompt parameters (e.g., correct model vs. source_processing type)
    // TODO: Move into subfolder / function?

    // Step 3a.
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

    // Step 3b.
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

    // Step 3c.
    if (initialState && !initialState.sampler) {
      initialState.sampler = 'k_euler'

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_4c',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 3d.
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

    // Step 3e.
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

    // Step 4. Check for other query param states.
    // Step 4a. If query param is for loading a model, set model:
    // @ts-ignore
    if (initialState && query[CREATE_PAGE_PARAM.LoadModel]) {
      // @ts-ignore
      initialState.models = [query[CREATE_PAGE_PARAM.LoadModel] as string]

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_5a',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 4b. If query param is a prompt, set prompt:
    // @ts-ignore
    if (initialState && query[CREATE_PAGE_PARAM.Prompt]) {
      initialState.prompt = query[CreatePageMode.PROMPT] as string

      logToConsole({
        data: initialState,
        name: 'LoadInput_Step_5b',
        debugKey: 'DEBUG_LOAD_INPUT'
      })
    }

    // Step 5. Validate if inpainting or img2img
    if (initialState?.source_mask && initialState?.source_image) {
      initialState.source_processing = SourceProcessing.InPainting
    } else if (initialState?.source_image) {
      initialState.source_processing = SourceProcessing.Img2Img
    } else if (initialState?.source_mask && !initialState?.source_image) {
      initialState.source_mask = ''
      initialState.source_processing = SourceProcessing.Prompt
    }

    // Step 6. Set input
    setInput({ ...(initialState as DefaultPromptInput) })

    logToConsole({
      data: initialState,
      name: 'LoadInput_Step_8',
      debugKey: 'DEBUG_LOAD_INPUT'
    })

    // Step 7. Set pageLoaded so we can start error checking and auto saving input.
    setPageLoaded(true)
  }, [query, setInput, setPageLoaded])

  // DO NOT SET INPUT STUFF until after useEffect runs! Let this function be the sole source of input truth.
  // Check various load states and modes for CreatePage and set preferences based on that here.
  // Thoughts: if we handle all initial input state here, we shouldn't need to track various modes.
  // e.g., anywhere else on the site uses the "savePrompt" method. This simply loads it.
  useEffect(() => {
    handleInitLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    setQuery({
      drawing: searchParams?.get('drawing'),
      i: searchParams?.get('i'),
      model: searchParams?.get('model'),
      prompt: searchParams?.get('prompt')
    })
  }, [searchParams])

  useEffect(() => {
    if (typeof width !== 'undefined' && width < 640) {
      return
    }

    // Handle if component is not visible at top of viewport
    const observerCallback = (entries: any) => {
      const entry = entries[0]
      if (entry.boundingClientRect.top < -25) {
        setActionPanelVisible(false)
      } else if (entry.isIntersecting && entry.boundingClientRect.top >= 0) {
        setActionPanelVisible(true)
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0, 1], // this will ensure the callback is triggered both when the element is fully visible and fully hidden
      rootMargin: '-25px 0px 0px 0px' // top margin of -25px
    })

    if (actionPanelRef.current) {
      observer.observe(actionPanelRef.current)
    }

    // Cleanup
    return () => {
      if (actionPanelRef.current) {
        observer.unobserve(actionPanelRef.current)
      }
    }
  }, [width])

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
    <main className={className}>
      <div className="flex flex-row items-center w-full">
        <PageTitle>
          Create a new image{' '}
          {input.source_processing === 'outpainting' && '(outpainting)'}
          {input.source_processing === 'inpainting' && '(inpainting)'}
          {input.source_processing === SourceProcessing.Img2Img && '(img2img)'}
        </PageTitle>
      </div>
      <div className={clsx('mt-0')}>
        <PromptInput />
        <FlexRow>
          <FormErrorMessage errors={errors} />
        </FlexRow>
        <InputValidationErrorDisplay
          modelDetails={modelDetails}
          setHasError={setHasError}
        />
        <FlexRow
          gap={4}
          style={{ alignItems: 'flex-start', position: 'relative' }}
        >
          <CreatePageSettings />

          <ActionPanel
            ref={actionPanelRef}
            errors={errors}
            resetInput={resetInput}
            handleSubmit={handleSubmit}
            pending={pending}
            totalImagesRequested={totalImagesRequested}
            loggedIn={loggedIn}
            totalKudosCost={totalKudosCost}
            kudosPerImage={kudosPerImage}
            showStylesDropdown
          />

          {!actionPanelVisible && (
            <FlexRow className={styles.ActionPanelFixedRow} gap={4}>
              <MaxWidth className={styles.ActionPanelFixedWrapper}>
                <FlexRow gap={4} style={{ alignItems: 'flex-start' }}>
                  <div style={{ paddingTop: '8px' }}>
                    <Button
                      id="ScrollToTopBtn"
                      onClick={() => {
                        window.scrollTo(0, 0)
                        setActionPanelVisible(true)
                      }}
                    >
                      <IconArrowBarToUp stroke={1.5} />
                    </Button>
                    <TooltipComponent hideIcon tooltipId="ScrollToTopBtn">
                      Scroll to the top of the page
                    </TooltipComponent>
                  </div>
                  <CreatePageSettings />
                  {hasError && (
                    <div
                      style={{ paddingTop: '8px' }}
                      id="FixedActionPanelError"
                      onClick={() => {
                        window.scrollTo(0, 0)
                        setActionPanelVisible(true)
                      }}
                    >
                      <IconAlertTriangle color="red" size={36} stroke={1} />
                      <TooltipComponent
                        hideIcon
                        tooltipId="FixedActionPanelError"
                      >
                        Scroll to the top to view errors
                      </TooltipComponent>
                    </div>
                  )}
                </FlexRow>

                <ActionPanel
                  errors={errors}
                  resetInput={resetInput}
                  handleSubmit={handleSubmit}
                  pending={pending}
                  totalImagesRequested={totalImagesRequested}
                  loggedIn={loggedIn}
                  totalKudosCost={totalKudosCost}
                  kudosPerImage={kudosPerImage}
                  showStylesDropdown
                />
              </MaxWidth>
            </FlexRow>
          )}
        </FlexRow>
      </div>

      <OptionsPanel setErrors={setErrors} />

      <ActionPanel
        errors={errors}
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
