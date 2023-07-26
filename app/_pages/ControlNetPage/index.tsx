'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import { useStore } from 'statery'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
import Uploader from 'app/_modules/Uploader'
import { Button } from 'components/UI/Button'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import DefaultPromptInput from 'models/DefaultPromptInput'
import {
  clearBase64FromDraw,
  getBase64FromDraw,
  setI2iUploaded
} from 'store/canvasStore'
import { userInfoStore } from 'store/userStore'
import { countImagesToGenerate, nearestWholeMultiple } from 'utils/imageUtils'
import { SourceProcessing } from 'utils/promptUtils'
import TrashIcon from 'components/icons/TrashIcon'
import ActionPanel from 'app/_pages/CreatePage/ActionPanel'
import { createImageJob } from 'utils/imageCache'
import CreateImageRequest from 'models/CreateImageRequest'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { useEffectOnce } from 'hooks/useEffectOnce'
import AppSettings from 'models/AppSettings'
import { toast } from 'react-toastify'
import { getInputCache } from 'store/inputCache'
import { kudosCostV2 } from 'utils/kudosCost'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import ControlNetOptions from 'app/_modules/AdvancedOptionsPanel/ControlNetOptions'
import UpscalerOptions from 'app/_modules/AdvancedOptionsPanel/UpscalerOptions'
import useComponentState from 'hooks/useComponentState'
import { trackEvent } from 'api/telemetry'
import PromptInput from '../CreatePage/PromptInput'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import SelectSampler from 'app/_modules/AdvancedOptionsPanel/SelectSampler'
import ImageCount from 'app/_modules/AdvancedOptionsPanel/ImageCount'
import PostProcessors from 'app/_modules/AdvancedOptionsPanel/PostProcessors'
import MiscOptions from 'app/_modules/AdvancedOptionsPanel/MiscOptions'
import Seed from 'app/_modules/AdvancedOptionsPanel/Seed'
import Steps from 'app/_modules/AdvancedOptionsPanel/Steps'
import Guidance from 'app/_modules/AdvancedOptionsPanel/Guidance'
import SelectModelDetails from 'app/_modules/AdvancedOptionsPanel/ModelDetails/modelDetails'

// Kind of a hacky way to persist output of image over the course of a session.
let cachedImageDetails = {}

const ControlNetPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [pending, setPending] = useState(false)

  const initialInput = {
    ...new DefaultPromptInput(),
    control_type: 'canny'
  }

  const [input, setInput] = useReducer((state: any, newState: any) => {
    return { ...state, ...newState }
  }, initialInput)

  const handleCacheInput = (params: DefaultPromptInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { source_image, ...inputParams } = params

    const string = JSON.stringify(inputParams)
    localStorage.setItem('controlnetPageInput', string)
  }

  const handleImportDrawing = () => {
    const data = getBase64FromDraw()

    const inputToLoad = {
      height: nearestWholeMultiple(data.height),
      width: nearestWholeMultiple(data.width),
      orientationType: 'custom',
      imageType: 'image/webp',
      source_image: data.base64,
      source_mask: '',
      source_processing: SourceProcessing.Img2Img
    }

    const importInput = getInputCache() || {}

    if (importInput.loadInputForControlNet && importInput.prompt) {
      // @ts-ignore
      inputToLoad.prompt = importInput.prompt
    }

    if (importInput.loadInputForControlNet && importInput.negative) {
      // @ts-ignore
      inputToLoad.negative = importInput.negative
    }

    if (importInput.loadInputForControlNet && importInput.models) {
      // @ts-ignore
      inputToLoad.models = importInput.models
    }

    if (importInput.loadInputForControlNet && importInput.steps) {
      // @ts-ignore
      inputToLoad.steps = importInput.steps
    }

    if (importInput.loadInputForControlNet && importInput.cfg_scale) {
      // @ts-ignore
      inputToLoad.cfg_scale = importInput.cfg_scale
    }

    if (importInput.loadInputForControlNet && importInput.control_type) {
      // @ts-ignore
      inputToLoad.control_type = importInput.control_type
    }

    setInput(inputToLoad)
  }

  const handleSaveImage = (data: any) => {
    const newBase64String = `data:${data.imageType};base64,${data.source_image}`

    setI2iUploaded({
      base64String: newBase64String,
      height: data.height,
      width: data.width
    })

    cachedImageDetails = {
      source_image: data.source_image,
      height: data.height,
      width: data.width
    }

    setInput({
      height: nearestWholeMultiple(data.height),
      width: nearestWholeMultiple(data.width),
      orientationType: 'custom',
      imageType: data.imageType,
      source_image: data.source_image,
      source_mask: '',
      source_processing: SourceProcessing.Img2Img
    })
  }

  const totalImagesRequested = countImagesToGenerate(input)

  const [errors, setErrors] = useComponentState(
    {} as { [key: string]: boolean }
  )

  const handleSubmit = useCallback(async () => {
    if (pending) {
      return
    }

    setPending(true)

    if (!input?.source_image) {
      setErrors({ SOURCE_IMAGE_EMPTY: true })
      setPending(false)
      return
    }

    if (!input?.prompt || input?.prompt.trim() === '') {
      setErrors({ PROMPT_EMPTY: true })
      setPending(false)
      return
    }

    const inputToSubmit = { ...input }

    await createImageJob(new CreateImageRequest(inputToSubmit))

    if (!AppSettings.get('stayOnCreate')) {
      router.push('/pending')
    } else {
      toast.success(
        `${totalImagesRequested > 1 ? 'Images' : 'Image'} requested!`,
        {
          pauseOnFocusLoss: false,
          position: 'top-center',
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: 'light'
        }
      )

      setErrors({ SOURCE_IMAGE_EMPTY: false })
      setErrors({ PROMPT_EMPTY: false })
      setPending(false)
    }
  }, [input, pending, router, setErrors, totalImagesRequested])

  useEffectOnce(() => {
    const string = localStorage.getItem('controlnetPageInput')
    const cached = string ? JSON.parse(string) : {}
    const updateObj = Object.assign(
      {},
      new DefaultPromptInput(),
      cached,
      cachedImageDetails
    )

    // Handle the incorrect decision I had earlier made to set empty value of control_type to 'none' instead of just ''.
    if (updateObj.control_type === 'none' || updateObj.control_type === '') {
      updateObj.control_type = ''
    }

    setInput({ ...updateObj })

    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/controlnet'
    })
  })

  useEffect(() => {
    handleCacheInput(input)
  }, [input])

  useEffect(() => {
    if (searchParams?.get('drawing')) {
      handleImportDrawing()
    }
  }, [searchParams])

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
    <div>
      <Head>
        <title>ControlNet - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - ControlNet" />
        <meta
          name="twitter:description"
          content="Use a source image and text prompt to better control diffusion models, and create amazing images with generative AI."
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robot_control.jpg"
        />
      </Head>
      <div className="flex flex-row items-center w-full">
        <div className="inline-block w-1/2">
          <PageTitle>ControlNet</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2"></div>
      </div>
      <Section first>
        <SubSectionTitle>Step 1. Upload an image</SubSectionTitle>
        <div>
          {!input.source_image && (
            <Uploader handleSaveImage={handleSaveImage} type="ControlNet" />
          )}
          {input.source_image && (
            <div className="flex flex-col justify-center w-full align-center">
              <img
                src={`data:${input.imageType};base64,${input.source_image}`}
                alt="Uploaded image for ControlNet"
                style={{
                  boxShadow: '2px 2px 4px 1px rgba(0, 0, 0, 0.75)',
                  margin: '0 auto',
                  maxWidth: `1024px`,
                  maxHeight: `100%`,
                  width: '100%'
                }}
              />
              <div className="flex flex-row justify-end w-full mt-2">
                <Button
                  theme="secondary"
                  onClick={() => {
                    cachedImageDetails = {}
                    setInput({ source_image: '' })
                    clearBase64FromDraw()
                  }}
                >
                  <TrashIcon />
                  Remove image?
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
      <Section>
        <SubSectionTitle>Step 2. Prompts</SubSectionTitle>
        <div
          className="flex flex-col w-full gap-2 rounded"
          style={{
            color: '#ffffff',
            backgroundColor: 'var(--accent-color)'
          }}
        >
          <PromptInput input={input} setInput={setInput} />
        </div>
      </Section>

      <Section>
        <SubSectionTitle>Step 3. Advanced settings</SubSectionTitle>

        <FlexibleRow style={{ paddingTop: '8px' }}>
          <FlexibleUnit>
            <ControlNetOptions input={input} setInput={setInput} />
          </FlexibleUnit>
          <FlexibleUnit>
            <NumericInputSlider
              label="Denoise"
              tooltip="Amount of noise added to input image. Values that
                  approach 1.0 allow for lots of variations but will
                  also produce images that are not semantically
                  consistent with the input. Only available for img2img."
              from={0.0}
              to={1.0}
              step={0.05}
              input={input}
              setInput={setInput}
              fieldName="denoising_strength"
              disabled={
                input.models &&
                input.models[0] &&
                input.models[0].indexOf('_inpainting') >= 0
              }
            />
          </FlexibleUnit>
        </FlexibleRow>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <SelectSampler input={input} setInput={setInput} />
            </FlexibleUnit>
            <FlexibleUnit>
              <ImageCount input={input} setInput={setInput} />
            </FlexibleUnit>
          </FlexibleRow>
        </Section>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <SelectModel input={input} setInput={setInput} />
              <SelectModelDetails
                models={input.models}
                multiModels={input.useAllModels || input.useFavoriteModels}
              />
            </FlexibleUnit>
            <FlexibleUnit>
              <Section>
                <Steps input={input} setInput={setInput} />
                <Guidance input={input} setInput={setInput} />
                <Seed input={input} setInput={setInput} />
                <NumericInputSlider
                  label="CLIP skip"
                  tooltip="Determine how early to stop processing a prompt using CLIP. Higher
          values stop processing earlier. Default is 1 (no skip)."
                  from={1}
                  to={12}
                  step={1}
                  input={input}
                  setInput={setInput}
                  fieldName="clipskip"
                  fullWidth
                  enforceStepValue
                />
              </Section>
            </FlexibleUnit>
          </FlexibleRow>
        </Section>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <PostProcessors input={input} setInput={setInput} />
            </FlexibleUnit>
            <FlexibleUnit>
              <UpscalerOptions input={input} setInput={setInput} />
            </FlexibleUnit>
          </FlexibleRow>
        </Section>
        <MiscOptions input={input} setInput={setInput} />
      </Section>

      <ActionPanel
        disableSubmit={!input.source_image}
        errors={errors}
        input={input}
        setInput={setInput}
        resetInput={() => {
          setInput({ ...new DefaultPromptInput() })
          window.scrollTo(0, 0)
        }}
        handleSubmit={handleSubmit}
        pending={pending}
        totalImagesRequested={totalImagesRequested}
        loggedIn={loggedIn}
        totalKudosCost={totalKudosCost}
        kudosPerImage={kudosPerImage}
      />
    </div>
  )
}

export default ControlNetPage
