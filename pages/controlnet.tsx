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
import { getBase64FromDraw, setI2iUploaded } from '../store/canvasStore'
import { userInfoStore } from '../store/userStore'
import {
  countImagesToGenerate,
  kudosCost,
  nearestWholeMultiple
} from '../utils/imageUtils'
import { validModelsArray } from '../utils/modelUtils'
import { SourceProcessing } from '../utils/promptUtils'
import Checkbox from '../components/UI/Checkbox'
import ClipSkip from '../components/CreatePage/AdvancedOptionsPanel/ClipSkip'
import TrashIcon from '../components/icons/TrashIcon'
import SquarePlusIcon from '../components/icons/SquarePlusIcon'
import Linker from '../components/UI/Linker'
import { createImageJob } from '../utils/imageCache'
import CreateImageRequest from '../models/CreateImageRequest'
import { useRouter } from 'next/router'
import Head from 'next/head'

let cacheSessionSettings: any = null

const ControlNet = () => {
  const router = useRouter()
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [pending, setPending] = useState(false)
  const [hasError, setHasError] = useState('')

  const [input, setInput] = useReducer(
    (state: any, newState: any) => {
      return { ...state, ...newState }
    },
    cacheSessionSettings !== null
      ? cacheSessionSettings
      : new DefaultPromptInput({ control_type: 'canny' })
  )

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
      const newPost = [...input.post_processing]

      const index = newPost.indexOf(value)
      if (index > -1) {
        newPost.splice(index, 1)
      } else {
        if (value === 'RealESRGAN_x4plus') {
          setInput({ numImages: 1 })
        }
        newPost.push(value)
      }

      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  const handleImportDrawing = () => {
    const data = getBase64FromDraw()

    setInput({
      height: nearestWholeMultiple(data.height),
      width: nearestWholeMultiple(data.width),
      orientationType: 'custom',
      imageType: 'image/webp',
      source_image: data.base64,
      source_mask: '',
      source_processing: SourceProcessing.Img2Img
    })
  }

  const handleSaveImage = (data: any) => {
    const newBase64String = `data:${data.imageType};base64,${data.source_image}`

    setI2iUploaded({
      base64String: newBase64String,
      height: data.height,
      width: data.width
    })

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
    modelsArray.push({
      name: 'random',
      value: 'random',
      label: 'Random!',
      count: 1
    })

    return modelsArray
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
    router.push('/pending')
  }, [input, pending, router])

  useEffect(() => {
    cacheSessionSettings = { ...input }
  }, [input])

  useEffect(() => {
    if (router.query.drawing) {
      handleImportDrawing()
    }
  }, [router.query.drawing])

  const totalImagesRequested = countImagesToGenerate(input)
  let totalKudosCost = kudosCost(
    input.width,
    input.height,
    input.steps,
    totalImagesRequested || 1,
    input.post_processing.indexOf('RealESRGAN_x4plus') === -1 ? false : true,
    input.post_processing.length,
    input.sampler
  )

  if (controlTypeValue.value !== 'none') {
    totalKudosCost = totalKudosCost * 3
  }

  const kudosPerImage =
    totalImagesRequested < 1 ||
    isNaN(totalKudosCost) ||
    isNaN(totalImagesRequested)
      ? 'N/A'
      : Number(totalKudosCost / totalImagesRequested).toFixed(2)

  return (
    <>
      <Head>
        <title>ControlNet - ArtBot for Stable Diffusion</title>
      </Head>
      <PageTitle>ControlNet</PageTitle>
      <Section first>
        <SubSectionTitle>Step 1. Upload an image</SubSectionTitle>
        <div>
          {!input.source_image && (
            <Uploader handleSaveImage={handleSaveImage} type="inpainting" />
          )}
          {input.source_image && (
            <div className="flex flex-row w-full align-center justify-center">
              <img
                src={`data:${input.imageType};base64,${input.source_image}`}
                alt="Uploaded image for ControlNet"
                style={{
                  boxShadow: '2px 2px 4px 1px rgba(0, 0, 0, 0.75)',
                  maxWidth: `100%`,
                  maxHeight: `100%`
                }}
              />
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
              setInput({ ...new DefaultPromptInput() })
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

                if (obj.value !== 'none') {
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
                    <Tooltip width="200px">
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
                    <Tooltip width="200px">
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
      </Section>
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Seed
            <Tooltip width="140px">Leave seed blank for random.</Tooltip>
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
            <Tooltip left="-20" width="240px">
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
          <Checkbox
            label={`RealESRGAN_x4plus (upscaler)`}
            value={getPostProcessing(`RealESRGAN_x4plus`)}
            onChange={() => handlePostProcessing(`RealESRGAN_x4plus`)}
          />
        </div>
      </Section>
      <Section>
        <ClipSkip
          input={input}
          setInput={setInput}
          handleChangeInput={handleChangeInput}
          handleNumberInput={handleNumberInput}
        />
      </Section>
      <Section>
        <div className="flex flex-row items-center justify-between">
          <SubSectionTitle>
            Number of images
            <div className="block text-xs w-full">(1 - {30})</div>
          </SubSectionTitle>
          <NumberInput
            // @ts-ignore
            className="mb-2"
            type="text"
            min={1}
            max={30}
            name="numImages"
            onMinusClick={() => {
              const value = input.numImages - 1
              setInput({ numImages: value })
            }}
            onPlusClick={() => {
              const value = input.numImages + 1
              setInput({ numImages: value })
            }}
            onChange={handleNumberInput}
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 30
              ) {
                setInput({ numImages: 1 })
              }
            }}
            // @ts-ignore
            value={input.numImages}
            width="100%"
          />
        </div>
        <div className="mb-4">
          <Slider
            value={input.numImages}
            min={1}
            max={30}
            onChange={(e: any) => {
              const event = {
                target: {
                  name: 'numImages',
                  value: Number(e.target.value)
                }
              }

              // @ts-ignore
              handleChangeInput(event)
            }}
          />
        </div>
      </Section>
      {hasError && (
        <Section>
          <div className="mt-2 text-red-500 font-semibold">
            Error: {hasError}
          </div>
        </Section>
      )}
      <Section>
        <div className="mt-2 mb-4 w-full flex flex-col md:flex-row gap-2 justify-end items-start">
          <div className="w-full md:w-1/2 flex flex-col justify-start gap-2">
            <div className="flex flex-row justify-end gap-2 sm:mt-0">
              <Button
                title="Clear current input"
                btnType="secondary"
                onClick={() => {
                  setInput({ ...new DefaultPromptInput() })
                  window.scrollTo(0, 0)
                }}
              >
                <span>
                  <TrashIcon />
                </span>
                <span className="hidden md:inline-block">Clear</span>
              </Button>
              <Button
                title="Create new image"
                onClick={handleSubmit}
                width="100px"
              >
                <span>
                  <SquarePlusIcon />
                </span>
                {pending ? 'Creating...' : 'Create'}
              </Button>
            </div>
            <div className="flex flex-row justify-end">
              <div className="flex flex-col justify-end">
                <div className="text-xs flex flex-row justify-end gap-2">
                  Images to request:{' '}
                  <strong>{' ' + totalImagesRequested}</strong>
                </div>
                {loggedIn && (
                  <>
                    <div className="text-xs flex flex-row justify-end gap-2">
                      {' '}
                      Generation cost:{' '}
                      <Linker href="/faq#kudos" passHref>
                        <>{totalKudosCost} kudos</>
                      </Linker>
                    </div>
                    <div className="text-xs flex flex-row justify-end gap-2">
                      Per image:{' '}
                      <Linker href="/faq#kudos" passHref>
                        <>{kudosPerImage} kudos</>
                      </Linker>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

export default ControlNet
