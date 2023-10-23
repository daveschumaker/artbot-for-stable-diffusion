'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'statery'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
import Uploader from 'app/_modules/Uploader'
import { Button } from 'app/_components/Button'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import {
  clearBase64FromDraw,
  getBase64FromDraw,
  setI2iUploaded
} from 'app/_store/canvasStore'
import { userInfoStore } from 'app/_store/userStore'
import {
  countImagesToGenerate,
  nearestWholeMultiple
} from 'app/_utils/imageUtils'
import { SourceProcessing } from 'app/_utils/promptUtils'
import ActionPanel from 'app/_pages/CreatePage/ActionPanel'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import AppSettings from 'app/_data-models/AppSettings'
import { getInputCache } from 'app/_store/inputCache'
import { kudosCostV2 } from 'app/_utils/kudosCost'
import ControlNetOptions from 'app/_modules/AdvancedOptionsPanel/ControlNetOptions'
import UpscalerOptions from 'app/_modules/AdvancedOptionsPanel/UpscalerOptions'
import useComponentState from 'app/_hooks/useComponentState'
import { trackEvent } from 'app/_api/telemetry'
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
import Denoise from 'app/_modules/AdvancedOptionsPanel/Denoise'
import ClipSkip from 'app/_modules/AdvancedOptionsPanel/ClipSkip'
import { baseHost, basePath } from 'BASE_PATH'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import FlexRow from 'app/_components/FlexRow'
import FormErrorMessage from '../CreatePage/ActionPanel/FormErrorMessage'
import { IconTrash } from '@tabler/icons-react'
import { createImageJob } from 'app/_utils/V2/createImageJob'
import { useInput } from 'app/_modules/InputProvider/context'

// Kind of a hacky way to persist output of image over the course of a session.
let cachedImageDetails = {}

const ControlNetPage = () => {
  const { input, setInput } = useInput()

  const router = useRouter()
  const searchParams = useSearchParams()

  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [pending, setPending] = useState(false)

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
    await createImageJob(inputToSubmit)

    if (!AppSettings.get('stayOnCreate')) {
      router.push('/pending')
    } else {
      showSuccessToast({
        message: `${totalImagesRequested > 1 ? 'Images' : 'Image'} requested!`
      })

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Set initial input for ControlNet
  useEffect(() => {
    const initialInput: DefaultPromptInput = {
      ...new DefaultPromptInput(),
      control_type: 'canny',
      denoising_strength: 0.75
    }

    setInput(initialInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          content={`${baseHost}${basePath}/robot_control.jpg`}
        />
      </Head>
      <div className="flex flex-row items-center w-full">
        <div className="inline-block w-1/2">
          <PageTitle>ControlNet</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2"></div>
      </div>
      <Section>
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
                  <IconTrash />
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
          <PromptInput />
        </div>
      </Section>

      <Section>
        <SubSectionTitle>Step 3. Advanced settings</SubSectionTitle>

        <FlexibleRow style={{ paddingTop: '8px' }}>
          <FlexibleUnit>
            <ControlNetOptions />
          </FlexibleUnit>
          <FlexibleUnit>
            <Denoise />
          </FlexibleUnit>
        </FlexibleRow>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <SelectSampler />
            </FlexibleUnit>
            <FlexibleUnit>
              <ImageCount />
            </FlexibleUnit>
          </FlexibleRow>
        </Section>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <SelectModel />
            </FlexibleUnit>
            <FlexibleUnit>
              <Section>
                <Steps />
                <Guidance />
                <Seed />
                <ClipSkip />
              </Section>
            </FlexibleUnit>
          </FlexibleRow>
        </Section>

        <Section>
          <FlexibleRow>
            <FlexibleUnit>
              <PostProcessors />
            </FlexibleUnit>
            <FlexibleUnit>
              <UpscalerOptions />
            </FlexibleUnit>
          </FlexibleRow>
        </Section>
        <MiscOptions />
      </Section>
      <FlexRow>
        <FormErrorMessage errors={errors} />
      </FlexRow>
      <ActionPanel
        disableSubmit={!input.source_image}
        errors={errors}
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
