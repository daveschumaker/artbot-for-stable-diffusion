/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useReducer, useState } from 'react'
import { useStore } from 'statery'
import SelectModel from '../components/CreatePage/AdvancedOptionsPanel/SelectModel/selectModel'
import Uploader from '../components/CreatePage/Uploader'
import ArrowBarLeftIcon from '../components/icons/ArrowBarLeftIcon'
import GrainIcon from '../components/icons/GrainIcon'
import { Button } from '../components/UI/Button'
import FlexRow from '../components/UI/FlexRow'
import Input from '../components/UI/Input'
import MaxWidth from '../components/UI/MaxWidth'
import NumberInput from '../components/UI/NumberInput'
import PageTitle from '../components/UI/PageTitle'
import Section from '../components/UI/Section'
import SelectComponent from '../components/UI/Select'
import Slider from '../components/UI/Slider'
import SplitPanel from '../components/UI/SplitPanel'
import SubSectionTitle from '../components/UI/SubSectionTitle'
import TextArea from '../components/UI/TextArea'
import TextTooltipRow from '../components/UI/TextTooltipRow'
import Tooltip from '../components/UI/Tooltip'
import TwoPanel from '../components/UI/TwoPanel'
import { CONTROL_TYPE_ARRAY } from '../constants'
import DefaultPromptInput from '../models/DefaultPromptInput'
import {
  clearBase64FromDraw,
  getBase64FromDraw,
  setI2iUploaded
} from '../store/canvasStore'
import { userInfoStore } from '../store/userStore'
import {
  countImagesToGenerate,
  nearestWholeMultiple
} from '../utils/imageUtils'
import { validModelsArray } from '../utils/modelUtils'
import { SourceProcessing } from '../utils/promptUtils'
import Checkbox from '../components/UI/Checkbox'
import ClipSkip from '../components/CreatePage/AdvancedOptionsPanel/ClipSkip'
import TrashIcon from '../components/icons/TrashIcon'
import ActionPanel from '../components/CreatePage/ActionPanel'
import { createImageJob } from '../utils/imageCache'
import CreateImageRequest from '../models/CreateImageRequest'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { IModelDetails, modelInfoStore } from '../store/modelStore'
import MenuButton from '../components/UI/MenuButton'
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon'
import DropDown from '../components/UI/DropDownV2/DropDownMenu'
import DropDownItem from '../components/UI/DropDownV2/DropDownMenuItem'
import SquareIcon from '../components/icons/SquareIcon'
import AppSettings from '../models/AppSettings'
import CheckboxIcon from '../components/icons/CheckboxIcon'
import { toast } from 'react-toastify'
import { getInputCache } from '../store/inputCache'
import { kudosCostV2 } from '../utils/kudosCost'
import PromptInputSettings from '../models/PromptInputSettings'
import NumericInputSlider from 'components/CreatePage/AdvancedOptionsPanel/NumericInputSlider'

// Kind of a hacky way to persist output of image over the course of a session.
let cachedImageDetails = {}

const ControlNet = () => {
  const router = useRouter()
  const modelState = useStore(modelInfoStore)
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState
  const { modelDetails } = modelState

  const [pending, setPending] = useState(false)
  const [hasError, setHasError] = useState('')
  const [stayOnPage, setStayOnPage] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

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

  const handleChangeInput = (event: InputEvent) => {
    if (!event || !event.target) {
      return
    }

    // @ts-ignore
    const inputName = event.target.name

    // @ts-ignore
    const inputValue = event.target.value

    setInput({ [inputName]: inputValue })
  }

  const handleNumberInput = (e: any) => {
    const event = {
      target: {
        name: e.target.name,
        value: Number(e.target.value)
      }
    }

    // @ts-ignore
    handleChangeInput(event)
  }

  const handlePostProcessing = useCallback(
    (value: string) => {
      let newPost = [...input.post_processing]
      const index = newPost.indexOf(value)

      if (index > -1) {
        newPost.splice(index, 1)
      } else {
        const idx_1 = input.post_processing.indexOf('RealESRGAN_x4plus')
        const idx_2 = input.post_processing.indexOf(
          'RealESRGAN_x4plus_anime_6B'
        )
        if (value === 'RealESRGAN_x4plus' && idx_2 >= 0) {
          newPost.splice(idx_2, 1)
        } else if (value === 'RealESRGAN_x4plus_anime_6B' && idx_1 >= 0) {
          newPost.splice(idx_1, 1)
        }

        newPost.push(value)
      }

      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

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

  const modelerOptions = (imageParams: any) => {
    const modelsArray = validModelsArray({ imageParams }) || []

    const filteredArray = modelsArray.filter((model: IModelDetails) => {
      if (!modelDetails[model.name]) {
        return
      }

      return modelDetails[model.name]?.baseline === 'stable diffusion 1'
    })

    return filteredArray
  }

  const getPostProcessing = useCallback(
    (value: string) => {
      return input.post_processing.indexOf(value) >= 0
    },
    [input.post_processing]
  )

  let controlTypeValue = { value: 'canny', label: 'canny' }

  if (CONTROL_TYPE_ARRAY.indexOf(input.control_type) >= 0) {
    controlTypeValue = {
      value: input.control_type,
      label: input.control_type
    }
  }

  const totalImagesRequested = countImagesToGenerate(input)

  const handleSubmit = useCallback(async () => {
    if (pending) {
      return
    }

    setPending(true)

    if (!input?.source_image) {
      setHasError('Please upload a source image to continue')
      setPending(false)
      return
    }

    if (!input?.prompt || input?.prompt.trim() === '') {
      setHasError('Please enter a prompt to continue.')
      setPending(false)
      return
    }

    const inputToSubmit = { ...input }

    await createImageJob(new CreateImageRequest(inputToSubmit))

    if (!stayOnPage) {
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

      setHasError('')
      setPending(false)
    }
  }, [input, pending, router, stayOnPage, totalImagesRequested])

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
    setStayOnPage(AppSettings.get('controlNetPageStay') === true ? true : false)
  })

  useEffect(() => {
    handleCacheInput(input)
  }, [input])

  useEffect(() => {
    if (router.query.drawing) {
      handleImportDrawing()
    }
  }, [router.query.drawing])

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
    <>
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
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          <PageTitle>ControlNet</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <MenuButton
            // active={componentState.showLayoutMenu}
            title="Change layout"
            onClick={() => {
              setShowOptionsMenu(true)
            }}
          >
            <DotsVerticalIcon size={24} />
          </MenuButton>
          {showOptionsMenu && (
            <DropDown
              alignRight
              handleClose={() => {
                setShowOptionsMenu(false)
              }}
              style={{ top: '38px' }}
            >
              <DropDownItem
                handleClick={() => {
                  AppSettings.set('controlNetPageStay', !stayOnPage)
                  setStayOnPage(!stayOnPage)
                }}
              >
                {stayOnPage === true ? <CheckboxIcon /> : <SquareIcon />}
                Stay on page?
              </DropDownItem>
            </DropDown>
          )}
        </div>
      </div>
      <Section first>
        <SubSectionTitle>Step 1. Upload an image</SubSectionTitle>
        <div>
          {!input.source_image && (
            <Uploader handleSaveImage={handleSaveImage} type="ControlNet" />
          )}
          {input.source_image && (
            <div className="flex flex-col w-full align-center justify-center">
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
              <div className="flex flex-row w-full justify-end mt-2">
                <Button
                  btnType="secondary"
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
        <FlexRow className="mb-2">
          <TextArea
            name="prompt"
            placeholder="Describe your image..."
            // @ts-ignore
            onChange={handleChangeInput}
            value={input.prompt}
          />
          <Button
            title="Clear current input"
            btnType="secondary"
            onClick={() => {
              setInput({ prompt: '' })
            }}
          >
            <ArrowBarLeftIcon />
          </Button>
        </FlexRow>
        <FlexRow>
          <div className="flex flex-col gap-2 w-full">
            <div className="text-sm font-[700]">
              Negative prompt (optional):
            </div>
            <FlexRow>
              <TextArea
                name="negative"
                placeholder="Words to deemphasize from image"
                // @ts-ignore
                onChange={handleChangeInput}
                value={input.negative}
              />
              <Button
                title="Clear current input"
                btnType="secondary"
                onClick={() => {
                  // PromptInputSettings.set('negative', '')
                  setInput({
                    negative: ''
                  })
                }}
              >
                <ArrowBarLeftIcon />
              </Button>
            </FlexRow>
          </div>
        </FlexRow>
      </Section>
      <Section>
        <SubSectionTitle>Step 3. Advanced settings</SubSectionTitle>
        <Section>
          <SubSectionTitle>Control Type</SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <SelectComponent
              options={CONTROL_TYPE_ARRAY.filter((val) => val !== '').map(
                (value) => {
                  return { value, label: value }
                }
              )}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ control_type: obj.value })

                if (obj.value) {
                  setInput({ karras: false, hires: false })
                }
              }}
              isSearchable={false}
              value={controlTypeValue}
            />
          </MaxWidth>
        </Section>
        <TwoPanel>
          <SplitPanel>
            <Section>
              <div className="flex flex-row items-center justify-between">
                <SubSectionTitle>
                  <TextTooltipRow>
                    Steps
                    <Tooltip tooltipId="steps-tooltip">
                      Fewer steps generally result in quicker image generations.
                      Many models achieve full coherence after a certain number
                      of finite steps (60 - 90). Keep your initial queries in
                      the 30 - 50 range for best results.
                    </Tooltip>
                  </TextTooltipRow>
                  <div className="block text-xs w-full">
                    (1 - {loggedIn ? 30 : 20})
                  </div>
                </SubSectionTitle>
                <NumberInput
                  // @ts-ignore
                  // error={errorMessage.steps}
                  className="mb-2"
                  type="text"
                  min={1}
                  max={loggedIn ? 30 : 20}
                  onMinusClick={() => {
                    const value = input.steps - 1
                    // PromptInputSettings.set('steps', value)
                    setInput({ steps: value })
                  }}
                  onPlusClick={() => {
                    const value = input.steps + 1
                    // PromptInputSettings.set('steps', value)
                    setInput({ steps: value })
                  }}
                  name="steps"
                  onChange={handleNumberInput}
                  onBlur={(e: any) => {
                    const maxSteps = loggedIn ? 30 : 20
                    if (
                      isNaN(e.target.value) ||
                      e.target.value < 1 ||
                      e.target.value > maxSteps
                    ) {
                      setInput({ cfg_scale: 7 })
                    }
                  }}
                  // @ts-ignore
                  value={Number(input.steps)}
                  width="100%"
                />
              </div>
              <div className="mb-4">
                <Slider
                  value={input.steps}
                  min={1}
                  max={loggedIn ? 30 : 20}
                  onChange={(e: any) => {
                    const event = {
                      target: {
                        name: 'steps',
                        value: Number(e.target.value)
                      }
                    }

                    // @ts-ignore
                    handleChangeInput(event)
                  }}
                />
              </div>
            </Section>
          </SplitPanel>
          <SplitPanel>
            <Section>
              <div className="flex flex-row items-center justify-between">
                <SubSectionTitle>
                  <TextTooltipRow>
                    Guidance
                    <Tooltip tooltipId="guidance-tooltipz">
                      Higher numbers follow the prompt more closely. Lower
                      numbers give more creativity.
                    </Tooltip>
                  </TextTooltipRow>
                  <div className="block text-xs w-full">(1 - 30)</div>
                </SubSectionTitle>
                <NumberInput
                  // @ts-ignore
                  // error={errorMessage.cfg_scale}
                  className="mb-2"
                  type="text"
                  min={0.5}
                  max={30}
                  step={0.5}
                  onMinusClick={() => {
                    const value = input.cfg_scale - 0.5
                    // PromptInputSettings.set('cfg_scale', value)
                    setInput({ cfg_scale: value })
                  }}
                  onPlusClick={() => {
                    const value = input.cfg_scale + 0.5
                    // PromptInputSettings.set('cfg_scale', value)
                    setInput({ cfg_scale: value })
                  }}
                  name="cfg_scale"
                  onBlur={(e: any) => {
                    if (
                      isNaN(e.target.value) ||
                      e.target.value < 1 ||
                      e.target.value > 30
                    ) {
                      setInput({ cfg_scale: 7 })
                    }
                  }}
                  onChange={handleNumberInput}
                  // @ts-ignore
                  value={input.cfg_scale}
                  width="100%"
                />
              </div>
              <div className="mb-4">
                <Slider
                  value={input.cfg_scale}
                  min={1}
                  max={30}
                  step={0.5}
                  onChange={(e: any) => {
                    const event = {
                      target: {
                        name: 'cfg_scale',
                        value: Number(e.target.value)
                      }
                    }

                    // @ts-ignore
                    handleChangeInput(event)
                  }}
                />
              </div>
            </Section>
          </SplitPanel>
        </TwoPanel>
        <TwoPanel className="mt-4">
          <SplitPanel>
            <Section>
              <div className="flex flex-row items-center justify-between">
                <>
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Denoise{' '}
                      <Tooltip tooltipId="denoise-tooltip">
                        Amount of noise added to input image. Values that
                        approach 1.0 allow for lots of variations but will also
                        produce images that are not semantically consistent with
                        the input. Only available for img2img.
                      </Tooltip>
                    </TextTooltipRow>
                    <div className="block text-xs w-full">(0.0 - 1.0)</div>
                  </SubSectionTitle>
                  <NumberInput
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    step={0.05}
                    disabled={
                      input.models &&
                      input.models[0] &&
                      input.models[0].indexOf('_inpainting') >= 0
                    }
                    min={0}
                    max={1.0}
                    onBlur={(e: any) => {
                      if (Number(e.target.value < 0)) {
                        setInput({ denoising_strength: 0 })
                        return
                      }

                      if (Number(e.target.value > 1.0)) {
                        setInput({ denoising_strength: 1 })
                        return
                      }

                      if (isNaN(e.target.value)) {
                        setInput({ denoising_strength: 0.5 })
                        return
                      }
                    }}
                    onMinusClick={() => {
                      if (isNaN(input.denoising_strength)) {
                        input.denoising_strength = 0.5
                      }

                      if (Number(input.denoising_strength) > 1) {
                        PromptInputSettings.set('denoising_strength', 1)
                        setInput({ denoising_strength: 1 })
                        return
                      }

                      const value = Number(input.denoising_strength) - 0.05
                      const niceNumber = Number(value).toFixed(2)
                      setInput({ denoising_strength: niceNumber })
                    }}
                    onPlusClick={() => {
                      if (isNaN(input.denoising_strength)) {
                        input.denoising_strength = 0.5
                      }

                      const value = Number(input.denoising_strength) + 0.05
                      const niceNumber = Number(value).toFixed(2)
                      PromptInputSettings.set('denoising_strength', niceNumber)
                      setInput({ denoising_strength: niceNumber })
                    }}
                    name="denoising_strength"
                    onChange={handleNumberInput}
                    // @ts-ignore
                    value={input.denoising_strength}
                    width="100%"
                  />
                </>
              </div>
              {input.source_processing === SourceProcessing.InPainting &&
                input.models &&
                input.models[0] &&
                input.models[0].indexOf('_inpainting') >= 0 && (
                  <div className="mt-0 text-sm text-slate-500">
                    Note: Denoise disabled when inpainting model is used.
                  </div>
                )}
              <div className="mb-4">
                <Slider
                  disabled={
                    input.models &&
                    input.models[0] &&
                    input.models[0].indexOf('_inpainting') >= 0
                  }
                  value={input.denoising_strength}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e: any) => {
                    const event = {
                      target: {
                        name: 'denoising_strength',
                        value: Number(e.target.value)
                      }
                    }

                    // @ts-ignore
                    handleChangeInput(event)
                  }}
                />
              </div>
            </Section>
          </SplitPanel>
          <SplitPanel>
            <Section></Section>
          </SplitPanel>
        </TwoPanel>
      </Section>
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Seed
            <Tooltip tooltipId="seed-tooltip">
              Leave seed blank for random.
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <div className="flex flex-row gap-2">
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="seed"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.seed}
              width="100%"
            />
            <Button
              title="Generate random number"
              onClick={() => {
                const value = Math.abs((Math.random() * 2 ** 32) | 0)
                setInput({ seed: value })
              }}
            >
              <GrainIcon />
            </Button>
            <Button
              btnType="secondary"
              title="Generate random number"
              onClick={() => {
                setInput({ seed: '' })
              }}
            >
              <ArrowBarLeftIcon />
            </Button>
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SelectModel
          input={input}
          modelerOptions={modelerOptions}
          setInput={setInput}
        />
      </Section>

      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Post-processing
            <Tooltip tooltipId="post-processing-tooltip">
              Post-processing options such as face improvement and image
              upscaling.
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <div className="flex flex-col gap-2 items-start">
          <Checkbox
            label={`GFPGAN (improves faces)`}
            value={getPostProcessing('GFPGAN')}
            onChange={() => handlePostProcessing('GFPGAN')}
          />
          <Checkbox
            label={`CodeFormers (improves faces)`}
            value={getPostProcessing('CodeFormers')}
            onChange={() => handlePostProcessing('CodeFormers')}
          />
          {(getPostProcessing('GFPGAN') ||
            getPostProcessing('CodeFormers')) && (
              <NumericInputSlider
                label="Face-fix strength"
                tooltip="0.05 is the weakest effect (barely noticeable improvements), while 1.0 is the strongest effect."
                from={0.05}
                to={1.0}
                step={0.05}
                input={input}
                setInput={setInput}
                fieldName="facefixer_strength"
                initialLoad={false}
              />
            )}
          <Checkbox
            label={`RealESRGAN_x4plus (upscaler)`}
            value={getPostProcessing(`RealESRGAN_x4plus`)}
            onChange={() => handlePostProcessing(`RealESRGAN_x4plus`)}
          />
          <Checkbox
            label={`RealESRGAN_x4plus_anime_6B (upscaler)`}
            value={getPostProcessing(`RealESRGAN_x4plus_anime_6B`)}
            onChange={() => handlePostProcessing(`RealESRGAN_x4plus_anime_6B`)}
          />
        </div>
      </Section>

      <Section>
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
          initialLoad={false}
          fullWidth
        />
      </Section>

      <Section>
        <NumericInputSlider
          label="Number of images"
          from={1}
          to={30}
          step={1}
          input={input}
          setInput={setInput}
          fieldName="numImages"
          initialLoad={false}
          fullWidth
        />
      </Section>

      <ActionPanel
        hasValidationError={false}
        hasError={hasError}
        fixedSeedErrorMsg={fixedSeedErrorMsg}
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
    </>
  )
}

export default ControlNet
