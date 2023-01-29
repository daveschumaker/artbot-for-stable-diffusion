/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useStore } from 'statery'
import Switch from 'react-switch'

import SelectComponent from '../../UI/Select'
import Input from '../../UI/Input'
import Tooltip from '../../UI/Tooltip'
import { Button } from '../../UI/Button'
import TrashIcon from '../../icons/TrashIcon'
import { SourceProcessing } from '../../../utils/promptUtils'
import { nearestWholeMultiple } from '../../../utils/imageUtils'
import { userInfoStore } from '../../../store/userStore'
import { maxSteps } from '../../../utils/validationUtils'
import useErrorMessage from '../../../hooks/useErrorMessage'
import TextButton from '../../UI/TextButton'
import Linker from '../../UI/Linker'
import NegativePrompts from '../NegativePrompts'
import { db, getDefaultPrompt, setDefaultPrompt } from '../../../utils/db'
import { trackEvent } from '../../../api/telemetry'
import Checkbox from '../../UI/Checkbox'
import {
  MAX_DIMENSIONS_LOGGED_IN,
  MAX_DIMENSIONS_LOGGED_OUT,
  MAX_IMAGES_PER_JOB
} from '../../../constants'
import GrainIcon from '../../icons/GrainIcon'
import AppSettings from '../../../models/AppSettings'
import Slider from '../../UI/Slider'
import NumberInput from '../../UI/NumberInput'
import useComponentState from '../../../hooks/useComponentState'
import { validModelsArray } from '../../../utils/modelUtils'
import PromptInputSettings from '../../../models/PromptInputSettings'
import Section from '../../UI/Section'
import SubSectionTitle from '../../UI/SubSectionTitle'
import TextTooltipRow from '../../UI/TextTooltipRow'
import MaxWidth from '../../UI/MaxWidth'
import SelectModel from './SelectModel'

const NoSliderSpacer = styled.div`
  height: 14px;
  margin-bottom: 16px;
`

interface FlexRowProps {
  bottomPadding?: number
}

const FlexRow = styled.div<FlexRowProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;

  ${(props) =>
    props.bottomPadding &&
    `
    padding-bottom: ${props.bottomPadding}px;
  `}
`

const TwoPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 640px) {
    flex-direction: row;
    column-gap: 32px;
  }
`

const SplitPanel = styled.div`
  width: 100%;

  @media (min-width: 640px) {
    width: 50%;
  }
`

const orientationOptions = [
  { value: 'landscape-16x9', label: 'Landscape (16 x 9)' },
  { value: 'landscape', label: 'Landscape (3 x 2)' },
  { value: 'portrait', label: 'Portrait (2 x 3)' },
  { value: 'phone-bg', label: 'Phone background (9 x 21)' },
  { value: 'ultrawide', label: 'Ultrawide (21 x 9)' },
  { value: 'square', label: 'Square' },
  { value: 'custom', label: 'Custom' },
  { value: 'random', label: 'Random!' }
]

const samplerOptions = (input: any) => {
  if (input.models[0] === 'stable_diffusion_2.0') {
    return [{ value: 'dpmsolver', label: 'dpmsolver' }]
  }

  const options = [
    { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
    { value: 'k_dpm_2', label: 'k_dpm_2' },
    { value: 'k_euler_a', label: 'k_euler_a' },
    { value: 'k_euler', label: 'k_euler' },
    { value: 'k_heun', label: 'k_heun' },
    { value: 'k_lms', label: 'k_lms' }
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // Temporarily hide DDIM and PLMS based on convo with db0:
  // DDIM never worked in nataili. That reminds me, @Stable Horde: Integrator can you hide DDIM and PLMS until we get them working properly?
  // if (!img2img) {
  //   options.unshift({ value: 'PLMS', label: 'PLMS' })
  //   options.unshift({ value: 'DDIM', label: 'DDIM' })
  // }

  // Per hlky, these samplers do not currently work for img2img
  if (
    !input.img2img &&
    input.source_processing !== SourceProcessing.Img2Img &&
    input.source_processing !== SourceProcessing.InPainting
  ) {
    options.push({ value: 'k_dpm_fast', label: 'k_dpm_fast' })
    options.push({ value: 'k_dpm_adaptive', label: 'k_dpm_adaptive' })
    options.push({ value: 'k_dpmpp_2m', label: 'k_dpmpp_2m' })
    options.push({ value: 'k_dpmpp_2s_a', label: 'k_dpmpp_2s_a' })
    options.push({ value: 'k_dpmpp_sde', label: 'k_dpmpp_sde' })
  }

  options.push({ value: 'random', label: 'random' })

  return options
}

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
  setHasValidationError: any
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  handleOrientationSelect,
  input,
  setInput,
  setHasValidationError
}: Props) => {
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState
  const [errorMessage, setErrorMessage, hasError] = useErrorMessage()

  const [componentState, setComponentState] = useComponentState({
    showMultiModel: PromptInputSettings.get('showMultiModel') || false,
    showNegPane: false
  })

  const [initialLoad, setInitialLoad] = useState(true)

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]

  const samplerValue = samplerOptions(input).filter((option) => {
    return input.sampler === option.value
  })[0]

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

  // @ts-ignore
  const modelsValue = modelerOptions(input).filter((option) => {
    return input?.models?.indexOf(option.value) >= 0
  })

  const validateSteps = useCallback(() => {
    if (initialLoad) {
      return
    }

    if (
      isNaN(input.steps) ||
      input.steps < 1 ||
      input.steps > maxSteps({ sampler: input.sampler, loggedIn })
    ) {
      if (initialLoad) {
        return
      }

      setErrorMessage({
        steps: `Please enter a valid number between 1 and ${maxSteps({
          sampler: input.sampler,
          loggedIn
        })}`
      })
    } else {
      setErrorMessage({ steps: null })
    }
  }, [initialLoad, input.sampler, input.steps, loggedIn, setErrorMessage])

  useEffect(() => {
    // Handle condition where error message briefly appears on screen on initial load.
    setTimeout(() => {
      setInitialLoad(false)
    }, 750)
  }, [])

  const clearNegPrompt = () => {
    setDefaultPrompt('')
    PromptInputSettings.set('negative', '')
    setInput({ negative: '' })
  }

  const handleSaveNeg = useCallback(async () => {
    const trimInput = input.negative.trim()
    if (!trimInput) {
      return
    }

    const defaultPromptResult = (await getDefaultPrompt()) || []
    const [defaultPrompt = {}] = defaultPromptResult

    if (defaultPrompt.prompt === trimInput) {
      return
    }

    trackEvent({
      event: 'SAVE_DEFAULT_NEG_PROMPT',
      context: '/pages/index'
    })

    try {
      await db.prompts.add({
        prompt: trimInput,
        promptType: 'negative'
      })

      await setDefaultPrompt(trimInput)
    } catch (err) { }
  }, [input.negative])

  const getPostProcessing = useCallback(
    (value: string) => {
      return input.post_processing.indexOf(value) >= 0
    },
    [input.post_processing]
  )

  const handlePostProcessing = useCallback(
    (value: string) => {
      const newPost = [...input.post_processing]

      const index = newPost.indexOf(value)
      if (index > -1) {
        newPost.splice(index, 1)
      } else {
        trackEvent({
          event: 'USE_ALL_MODELS_CLICK',
          context: '/pages/index'
        })

        if (value === 'RealESRGAN_x4plus') {
          setInput({ numImages: 1 })
        }
        newPost.push(value)
      }

      PromptInputSettings.set('post_processing', newPost)
      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  useEffect(() => {
    if (initialLoad) {
      return
    }

    setHasValidationError(hasError)
  }, [hasError, initialLoad, setHasValidationError])

  useEffect(() => {
    validateSteps()
  }, [input.sampler, validateSteps])

  const favModels = AppSettings.get('favoriteModels') || {}

  // Dynamically display various options
  const showAllSamplersInput =
    input.source_processing !== SourceProcessing.Img2Img &&
    input.source_processing !== SourceProcessing.InPainting &&
    !input.useAllModels &&
    !input.useFavoriteModels &&
    !componentState.showMultiModel

  const showMultiSamplerInput =
    !input.useAllModels &&
    !input.useFavoriteModels &&
    !componentState.showMultiModel

  const showMultiModelSelect =
    !input.useMultiSteps &&
    !input.useAllSamplers &&
    !input.useAllModels &&
    !input.useFavoriteModels &&
    input.source_processing !== SourceProcessing.InPainting &&
    input.source_processing !== SourceProcessing.OutPaiting

  const showUseAllModelsInput =
    !input.useMultiSteps &&
    !input.useAllSamplers &&
    !componentState.showMultiModel &&
    !input.useFavoriteModels &&
    input.source_processing !== SourceProcessing.InPainting &&
    input.source_processing !== SourceProcessing.OutPaiting

  const showUseFavoriteModelsInput =
    !input.useMultiSteps &&
    !input.useAllSamplers &&
    !componentState.showMultiModel &&
    !input.useAllModels &&
    input.source_processing !==
    (SourceProcessing.InPainting || SourceProcessing.OutPaiting)

  const showNumImagesInput =
    !input.useAllModels && !input.useMultiSteps && !input.useAllSamplers

  return (
    <div>
      {componentState.showNegPane ? (
        <NegativePrompts
          open={componentState.showNegPane}
          handleClosePane={() => setComponentState({ showNegPane: false })}
          setInput={setInput}
        />
      ) : null}
      {input.parentJobId ? (
        <Section>
          <SubSectionTitle>Attached to previous job</SubSectionTitle>
          <div className="text-xs">
            This job will be associated with an{' '}
            <Linker href={`/job/${input.parentJobId}`}>existing job</Linker>.
          </div>
          <TextButton
            onClick={() => {
              trackEvent({
                event: 'REMOVE_PARENT_JOB_ID',
                context: '/pages/index'
              })

              setInput({
                parentJobId: ''
              })
            }}
          >
            Remove attachment?
          </TextButton>
        </Section>
      ) : null}
      <Section>
        <SubSectionTitle>Image orientation</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="480"
        >
          <SelectComponent
            options={orientationOptions}
            onChange={(obj: { value: string; label: string }) => {
              PromptInputSettings.set('orientationType', obj.value)
              handleOrientationSelect(obj.value)

              if (obj.value !== 'custom') {
                setErrorMessage({ height: null, width: null })
              }
            }}
            value={orientationValue}
            isSearchable={false}
          />
          {orientationValue?.value === 'custom' && (
            <>
              <div className="block text-xs mt-4 w-full">
                Max size for each dimension:{' '}
                {loggedIn
                  ? MAX_DIMENSIONS_LOGGED_IN
                  : MAX_DIMENSIONS_LOGGED_OUT}{' '}
                pixels
                {loggedIn && input.height * input.width > 1024 * 1024 && (
                  <div className="text-red-500 font-bold">
                    WARNING: You will need to have enough kudos to complete this
                    request.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 justify-start">
                <div className="mt-2 flex flex-row gap-4 items-center">
                  <div className="w-[80px]">
                    <SubSectionTitle>Width</SubSectionTitle>
                  </div>
                  <NumberInput
                    // @ts-ignore
                    type="text"
                    name="width"
                    min={64}
                    max={
                      loggedIn
                        ? MAX_DIMENSIONS_LOGGED_IN
                        : MAX_DIMENSIONS_LOGGED_OUT
                    }
                    onMinusClick={() => {
                      const value = Number(input.width) - 64
                      PromptInputSettings.set('width', value)
                      setInput({ width: value })
                    }}
                    onPlusClick={() => {
                      const value = Number(input.width) + 64
                      PromptInputSettings.set('width', value)
                      setInput({ width: value })
                    }}
                    error={errorMessage.width}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value >
                        (loggedIn
                          ? MAX_DIMENSIONS_LOGGED_IN
                          : MAX_DIMENSIONS_LOGGED_OUT)
                      ) {
                        if (initialLoad) {
                          return
                        }

                        setErrorMessage({
                          width: `Please enter a valid number between 64 and ${loggedIn
                              ? MAX_DIMENSIONS_LOGGED_IN
                              : MAX_DIMENSIONS_LOGGED_OUT
                            }`
                        })
                        return
                      }

                      if (errorMessage.width) {
                        setErrorMessage({ width: null })
                      }

                      PromptInputSettings.set(
                        'width',
                        nearestWholeMultiple(e.target.value)
                      )
                      setInput({
                        width: nearestWholeMultiple(e.target.value)
                      })
                    }}
                    // @ts-ignore
                    value={input.width}
                    width="75px"
                  />
                </div>
                {errorMessage.width && (
                  <div className="mb-2 text-red-500 font-bold">
                    {errorMessage.width}
                  </div>
                )}
                <div className="flex flex-row gap-4 items-center">
                  <div className="w-[80px]">
                    <SubSectionTitle>Height</SubSectionTitle>
                  </div>
                  <NumberInput
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    name="height"
                    min={64}
                    max={
                      loggedIn
                        ? MAX_DIMENSIONS_LOGGED_IN
                        : MAX_DIMENSIONS_LOGGED_OUT
                    }
                    onMinusClick={() => {
                      const value = Number(input.height) - 64
                      PromptInputSettings.set('height', value)
                      setInput({ height: value })
                    }}
                    onPlusClick={() => {
                      const value = Number(input.height) + 64
                      PromptInputSettings.set('height', value)
                      setInput({ height: value })
                    }}
                    error={errorMessage.height}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value >
                        (loggedIn
                          ? MAX_DIMENSIONS_LOGGED_IN
                          : MAX_DIMENSIONS_LOGGED_OUT)
                      ) {
                        if (initialLoad) {
                          return
                        }

                        setErrorMessage({
                          height: `Please enter a valid number between 64 and ${loggedIn
                              ? MAX_DIMENSIONS_LOGGED_IN
                              : MAX_DIMENSIONS_LOGGED_OUT
                            }`
                        })
                        return
                      }

                      if (errorMessage.height) {
                        setErrorMessage({ height: null })
                      }

                      PromptInputSettings.set(
                        'height',
                        nearestWholeMultiple(e.target.value)
                      )
                      setInput({
                        height: nearestWholeMultiple(e.target.value)
                      })
                    }}
                    // @ts-ignore
                    value={input.height}
                    width="75px"
                  />
                </div>
                {errorMessage.height && (
                  <div className="mb-2 text-red-500 font-bold">
                    {errorMessage.height}
                  </div>
                )}
              </div>
              <div className="block text-xs mt-2 w-full">
                Height and widths must be divisible by 64. Enter your desired
                dimensions and it will be automatically convereted to nearest
                valid integer.
              </div>
            </>
          )}
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Negative prompt
            <Tooltip width="180px">
              Add words or phrases to demphasize from your desired image
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <FlexRow>
          <Input
            // @ts-ignore
            className="mb-2"
            type="text"
            name="negative"
            onChange={handleChangeInput}
            // @ts-ignore
            value={input.negative}
            width="100%"
          />
          <Button
            title="Clear current input"
            btnType="secondary"
            onClick={() => {
              PromptInputSettings.set('negative', '')
              setInput({
                negative: ''
              })
            }}
          >
            <TrashIcon />
          </Button>
        </FlexRow>
        <FlexRow>
          <TextButton onClick={clearNegPrompt}>clear default</TextButton>
          <TextButton onClick={handleSaveNeg}>save as default</TextButton>
          <TextButton onClick={() => setComponentState({ showNegPane: true })}>
            load
          </TextButton>
        </FlexRow>
      </Section>
      {!input.useAllSamplers && (
        <Section>
          <SubSectionTitle>Sampler</SubSectionTitle>
          {input.source_processing === SourceProcessing.InPainting &&
            input.models[0] === 'stable_diffusion_inpainting' ? (
            <div className="mt-0 text-sm text-slate-500">
              Note: Sampler disabled when inpainting model is used.
            </div>
          ) : (
            <MaxWidth
              // @ts-ignore
              maxWidth="240"
            >
              <SelectComponent
                options={samplerOptions(input)}
                onChange={(obj: { value: string; label: string }) => {
                  PromptInputSettings.set('sampler', obj.value)
                  setInput({ sampler: obj.value })
                }}
                isSearchable={true}
                value={samplerValue}
              />
            </MaxWidth>
          )}
        </Section>
      )}
      {showAllSamplersInput && (
        <Section>
          <SubSectionTitle>
            <TextTooltipRow>
              Use all samplers
              <Tooltip left="-140" width="240px">
                Automatically generate an image for sampler
              </Tooltip>
            </TextTooltipRow>
          </SubSectionTitle>
          <Switch
            disabled={input.useMultiGuidance || input.useMultiSteps}
            onChange={() => {
              if (!input.useAllSamplers) {
                trackEvent({
                  event: 'USE_ALL_SAMPLERS_CLICK',
                  context: '/pages/index'
                })
                setInput({
                  numImages: 1,
                  useAllSamplers: true,
                  useAllModels: false,
                  useFavoriteModels: false,
                  useMultiSteps: false
                })

                PromptInputSettings.set('numImages', 1)
                PromptInputSettings.set('useAllSamplers', true)
                PromptInputSettings.set('useAllModels', false)
                PromptInputSettings.set('useFavoriteModels', false)
                PromptInputSettings.set('useMultiSteps', false)
              } else {
                PromptInputSettings.set('useAllSamplers', false)
                setInput({ useAllSamplers: false })
              }
            }}
            checked={input.useAllSamplers}
          />
        </Section>
      )}
      <TwoPanel className="mt-4">
        <SplitPanel>
          {!input.useMultiSteps && (
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
                    (1 - {maxSteps({ sampler: input.sampler, loggedIn })})
                  </div>
                </SubSectionTitle>
                <NumberInput
                  // @ts-ignore
                  error={errorMessage.steps}
                  className="mb-2"
                  type="text"
                  min={1}
                  max={maxSteps({ sampler: input.sampler, loggedIn })}
                  onMinusClick={() => {
                    const value = input.steps - 1
                    PromptInputSettings.set('steps', value)
                    setInput({ steps: value })
                  }}
                  onPlusClick={() => {
                    const value = input.steps + 1
                    PromptInputSettings.set('steps', value)
                    setInput({ steps: value })
                  }}
                  name="steps"
                  onChange={handleChangeInput}
                  onBlur={() => {
                    validateSteps()
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
                  max={maxSteps({
                    sampler: input.sampler,
                    loggedIn,
                    isSlider: true
                  })}
                  onChange={(e: any) => {
                    const event = {
                      target: {
                        name: 'steps',
                        value: e.target.value
                      }
                    }

                    handleChangeInput(event)
                  }}
                />
              </div>
              {errorMessage.steps && (
                <div className="mb-2 text-red-500 text-lg font-bold">
                  {errorMessage.steps}
                </div>
              )}
            </Section>
          )}
          {input.useMultiSteps && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Multi-steps
                      <Tooltip width="210px">
                        Comma separated values to create a series of images
                        using multiple steps. Example: 3,6,9,12,15
                      </Tooltip>
                    </TextTooltipRow>
                    <div className="block text-xs w-full">
                      (1 - {maxSteps({ sampler: input.sampler, loggedIn })})
                    </div>
                  </SubSectionTitle>
                </div>
                <Input
                  // @ts-ignore
                  error={errorMessage.multiSteps}
                  className="mb-2"
                  type="text"
                  name="multiSteps"
                  onChange={handleChangeInput}
                  placeholder="3,5,7,9"
                  // onBlur={() => {
                  //   validateSteps()
                  // }}
                  // @ts-ignore
                  value={input.multiSteps}
                  width="100%"
                />
              </div>
              {errorMessage.steps && (
                <div className="mb-2 text-red-500 text-lg font-bold">
                  {errorMessage.steps}
                </div>
              )}
              <NoSliderSpacer />
            </Section>
          )}
          {showMultiSamplerInput && (
            <Section>
              <SubSectionTitle>
                <TextTooltipRow>
                  Use multiple steps
                  <Tooltip left="-140" width="240px">
                    Provide a list of comma separated values to create a series
                    of images using multiple steps: &quot;3,6,9,12,15&quot;
                  </Tooltip>
                </TextTooltipRow>
              </SubSectionTitle>
              <Switch
                disabled={input.useMultiGuidance || input.useAllSamplers}
                onChange={() => {
                  if (!input.useMultiSteps) {
                    setInput({
                      useMultiSteps: true,
                      numImages: 1,
                      useAllModels: false,
                      useFavoriteModels: false,
                      useAllSamplers: false
                    })

                    PromptInputSettings.set('useMultiSteps', true)
                    PromptInputSettings.set('numImages', 1)
                    PromptInputSettings.set('useAllModels', false)
                    PromptInputSettings.set('useFavoriteModels', false)
                    PromptInputSettings.set('useAllSamplers', false)
                  } else {
                    PromptInputSettings.set('useMultiSteps', false)
                    setInput({ useMultiSteps: false })
                  }
                }}
                checked={input.useMultiSteps}
              />
            </Section>
          )}
        </SplitPanel>
        <SplitPanel>
          {!input.useMultiGuidance && (
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
                  error={errorMessage.cfg_scale}
                  className="mb-2"
                  type="text"
                  min={1}
                  max={30}
                  onMinusClick={() => {
                    const value = input.cfg_scale - 1
                    PromptInputSettings.set('cfg_scale', value)
                    setInput({ cfg_scale: value })
                  }}
                  onPlusClick={() => {
                    const value = input.cfg_scale + 1
                    PromptInputSettings.set('cfg_scale', value)
                    setInput({ cfg_scale: value })
                  }}
                  name="cfg_scale"
                  onBlur={(e: any) => {
                    if (
                      isNaN(e.target.value) ||
                      e.target.value < 1 ||
                      e.target.value > 30
                    ) {
                      if (initialLoad) {
                        return
                      }

                      setErrorMessage({
                        cfg_scale:
                          'Please enter a valid number between 1 and 30'
                      })
                    } else if (errorMessage.cfg_scale) {
                      setErrorMessage({ cfg_scale: null })
                    }
                  }}
                  onChange={handleChangeInput}
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
                  onChange={(e: any) => {
                    const event = {
                      target: {
                        name: 'cfg_scale',
                        value: e.target.value
                      }
                    }

                    handleChangeInput(event)
                  }}
                />
              </div>
              {errorMessage.cfg_scale && (
                <div className="mb-2 text-red-500 text-lg font-bold">
                  {errorMessage.cfg_scale}
                </div>
              )}
            </Section>
          )}
          {input.useMultiGuidance && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Guidance
                      <Tooltip width="200px">
                        Comma separated values to create a series of images
                        using multiple steps. Example: 3,6,9,12,15
                      </Tooltip>
                    </TextTooltipRow>
                    <div className="block text-xs w-full">(1 - 30)</div>
                  </SubSectionTitle>
                </div>
                <Input
                  // @ts-ignore
                  error={errorMessage.multiGuidance}
                  className="mb-2"
                  type="text"
                  name="multiGuidance"
                  onChange={handleChangeInput}
                  placeholder="3,5,7,9"
                  // onBlur={() => {
                  //   validateSteps()
                  // }}
                  // @ts-ignore
                  value={input.multiGuidance}
                  width="100%"
                />
              </div>
              {errorMessage.multiGuidance && (
                <div className="mb-2 text-red-500 text-lg font-bold">
                  {errorMessage.multiGuidance}
                </div>
              )}
              <NoSliderSpacer />
            </Section>
          )}
          {showMultiSamplerInput && (
            <Section>
              <SubSectionTitle>
                <TextTooltipRow>
                  Use multiple guidance
                  <Tooltip left="-140" width="240px">
                    Provide a list of comma separated values to create a series
                    of images using multiple guidance: &quot;3,6,9,12,15&quot;
                  </Tooltip>
                </TextTooltipRow>
              </SubSectionTitle>
              <Switch
                disabled={input.useMultiSteps || input.useAllSamplers}
                onChange={() => {
                  if (!input.useMultiGuidance) {
                    setInput({
                      useMultiGuidance: true,
                      useMultiSteps: false,
                      numImages: 1,
                      useAllModels: false,
                      useFavoriteModels: false,
                      useAllSamplers: false
                    })

                    PromptInputSettings.set('useMultiGuidance', true)
                    PromptInputSettings.set('useMultiSteps', false)
                    PromptInputSettings.set('numImages', 1)
                    PromptInputSettings.set('useAllModels', false)
                    PromptInputSettings.set('useFavoriteModels', false)
                    PromptInputSettings.set('useAllSamplers', false)
                  } else {
                    PromptInputSettings.set('useMultiGuidance', false)
                    setInput({ useMultiGuidance: false })
                  }
                }}
                checked={input.useMultiGuidance}
              />
            </Section>
          )}
        </SplitPanel>
      </TwoPanel>
      {(input.img2img ||
        input.source_processing === SourceProcessing.Img2Img ||
        input.source_processing === SourceProcessing.InPainting) && (
          <TwoPanel className="mt-4">
            <SplitPanel>
              <Section>
                <div className="flex flex-row items-center justify-between">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Denoise{' '}
                      <Tooltip width="200px">
                        Amount of noise added to input image. Values that approach
                        1.0 allow for lots of variations but will also produce
                        images that are not semantically consistent with the
                        input. Only available for img2img.
                      </Tooltip>
                    </TextTooltipRow>
                    <div className="block text-xs w-full">(0.0 - 1.0)</div>
                  </SubSectionTitle>
                  <NumberInput
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    step={0.05}
                    disabled={input.models[0] === 'stable_diffusion_inpainting'}
                    min={0}
                    max={1.0}
                    onBlur={(e: any) => {
                      if (Number(e.target.value < 0)) {
                        PromptInputSettings.set('denoising_strength', 0)
                        setInput({ denoising_strength: 0 })
                        return
                      }

                      if (Number(e.target.value > 1.0)) {
                        PromptInputSettings.set('denoising_strength', 1)
                        setInput({ denoising_strength: 1 })
                        return
                      }

                      if (isNaN(e.target.value)) {
                        PromptInputSettings.set('denoising_strength', 0.5)
                        setInput({ denoising_strength: 0.5 })
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 0 ||
                        e.target.value > 1.0
                      ) {
                        if (initialLoad) {
                          return
                        }

                        setErrorMessage({
                          denoising_strength: `Please enter a valid number between 0 and 1.0`
                        })
                      } else if (errorMessage.denoising_strength) {
                        setErrorMessage({ denoising_strength: null })
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
                      PromptInputSettings.set('denoising_strength', niceNumber)
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
                    onChange={handleChangeInput}
                    // @ts-ignore
                    value={input.denoising_strength}
                    width="100%"
                  />
                </div>
                {input.source_processing === SourceProcessing.InPainting &&
                  input.models[0] === 'stable_diffusion_inpainting' && (
                    <div className="mt-0 text-sm text-slate-500">
                      Note: Denoise disabled when inpainting model is used.
                    </div>
                  )}
                <div className="mb-4">
                  <Slider
                    disabled={input.models[0] === 'stable_diffusion_inpainting'}
                    value={input.denoising_strength}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(e: any) => {
                      const event = {
                        target: {
                          name: 'denoising_strength',
                          value: e.target.value
                        }
                      }

                      handleChangeInput(event)
                    }}
                  />
                </div>
                {errorMessage.denoising_strength && (
                  <div className="mb-2 text-red-500 text-lg font-bold">
                    {errorMessage.denoising_strength}
                  </div>
                )}
              </Section>
            </SplitPanel>
            <SplitPanel>
              <Section></Section>
            </SplitPanel>
          </TwoPanel>
        )}
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Tiling
            <Tooltip width="240px">
              Attempt to create seamless, repeatable textures. Note: This will
              not work for img2img or inpainting requests.
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Switch
            onChange={() => {
              if (!input.tiling) {
                setInput({ tiling: true })
                PromptInputSettings.set('tiling', true)
              } else {
                setInput({ tiling: false })
                PromptInputSettings.set('tiling', false)
              }
            }}
            checked={input.tiling}
          />
        </MaxWidth>
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
                if (AppSettings.get('saveSeedOnCreate')) {
                  PromptInputSettings.set('seed', value)
                }
                setInput({ seed: value })
              }}
            >
              <GrainIcon />
            </Button>
            <Button
              btnType="secondary"
              title="Generate random number"
              onClick={() => {
                PromptInputSettings.set('seed', '')
                setInput({ seed: '' })
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        </MaxWidth>
      </Section>
      {input.source_processing !== SourceProcessing.OutPaiting &&
        !input.useAllModels &&
        !componentState.showMultiModel &&
        !input.useFavoriteModels && (
          <SelectModel
            input={input}
            modelerOptions={modelerOptions}
            setInput={setInput}
          />
        )}
      {componentState.showMultiModel ? (
        <Section>
          <SubSectionTitle>
            Select Models
            <Tooltip width="240px">
              Models currently available within the horde. Numbers in
              parentheses indicate number of works. Generally, these models will
              generate images quicker.
            </Tooltip>
            <div className="text-xs">
              <Linker href="/info">[ View detailed model info ]</Linker>
            </div>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="480"
          >
            <SelectComponent
              closeMenuOnSelect={false}
              isMulti
              menuPlacement={'top'}
              //@ts-ignore
              options={modelerOptions(input)}
              onChange={(obj: Array<{ value: string; label: string }>) => {
                const modelArray: Array<string> = []

                obj.forEach((model: { value: string; label: string }) => {
                  modelArray.push(model.value)
                })

                let sampler = input.sampler

                if (input.sampler === 'dpmsolver' && modelArray.length > 1) {
                  sampler = 'k_euler_a'
                }

                PromptInputSettings.set('models', [...modelArray])
                PromptInputSettings.set('sampler', sampler)
                setInput({ models: [...modelArray], sampler })
              }}
              // @ts-ignore
              value={modelsValue}
              isSearchable={true}
            />
          </MaxWidth>
        </Section>
      ) : null}
      {showMultiModelSelect ? (
        <Section>
          <SubSectionTitle>
            <TextTooltipRow>
              Multi-model select
              <Tooltip left="-140" width="240px">
                Pick from multiple models that you might prefer.
              </Tooltip>
            </TextTooltipRow>
          </SubSectionTitle>
          <Switch
            onChange={() => {
              if (!componentState.showMultiModel) {
                trackEvent({
                  event: 'USE_MULTI_MODEL_SELECT',
                  context: '/pages/index'
                })
                setComponentState({
                  showMultiModel: true
                })
                setInput({
                  useAllSamplers: false,
                  useAllModels: false,
                  useFavoriteModels: false,
                  useMultiSteps: false
                })

                PromptInputSettings.set('showMultiModel', true)
                PromptInputSettings.set('useAllSamplers', false)
                PromptInputSettings.set('useAllModels', false)
                PromptInputSettings.set('useFavoriteModels', false)
                PromptInputSettings.set('useMultiSteps', false)
              } else {
                PromptInputSettings.set('showMultiModel', false)
                PromptInputSettings.set('models', [input.models[0]])

                setComponentState({
                  showMultiModel: false
                })
                setInput({
                  models: [input.models[0]]
                })
              }
            }}
            checked={componentState.showMultiModel}
          />
        </Section>
      ) : null}
      {showUseAllModelsInput ? (
        <Section>
          <SubSectionTitle>
            <>
              <TextTooltipRow>
                Use all available models (
                {
                  validModelsArray({
                    imageParams: input
                  })?.length
                }
                )
                <Tooltip left="-140" width="240px">
                  Automatically generate an image for each model currently
                  available on Stable Horde
                </Tooltip>
              </TextTooltipRow>
              <div className="mt-1 mb-2 text-xs">
                <Linker href="/info">[ View all model details ]</Linker>
              </div>
            </>
          </SubSectionTitle>
          <Switch
            onChange={() => {
              if (!input.useAllModels) {
                trackEvent({
                  event: 'USE_ALL_MODELS_CLICK',
                  context: '/pages/index'
                })
                setInput({
                  useAllModels: true,
                  useFavoriteModels: false,
                  useMultiSteps: false,
                  useAllSamplers: false,
                  numImages: 1
                })

                PromptInputSettings.set('useAllModels', true)
                PromptInputSettings.set('useFavoriteModels', false)
                PromptInputSettings.set('useMultiSteps', false)
                PromptInputSettings.set('useAllSamplers', false)
                PromptInputSettings.set('numImages', false)
              } else {
                PromptInputSettings.set('useAllModels', false)
                setInput({ useAllModels: false })
              }
            }}
            checked={input.useAllModels}
          />
        </Section>
      ) : null}
      {showUseFavoriteModelsInput ? (
        <Section>
          <SubSectionTitle>
            <TextTooltipRow>
              Use favorite models ({Object.keys(favModels).length})
              <Tooltip left="-140" width="240px">
                Automatically generate an image for each model you have
                favorited.
              </Tooltip>
            </TextTooltipRow>
            <div className="mt-1 mb-2 text-xs">
              <Linker href="/info?show=favorite-models">
                [ View favorite models ]
              </Linker>
            </div>
          </SubSectionTitle>
          <Switch
            disabled={Object.keys(favModels).length === 0}
            onChange={() => {
              if (!input.useFavoriteModels) {
                trackEvent({
                  event: 'USE_FAV_MODELS_CLICK',
                  context: '/pages/index'
                })
                setInput({
                  useFavoriteModels: true,
                  useAllSamplers: false,
                  useMultiSteps: false
                })
                PromptInputSettings.set('useFavoriteModels', true)
                PromptInputSettings.set('useAllSamplers', false)
                PromptInputSettings.set('useMultiSteps', false)
              } else {
                PromptInputSettings.set('useFavoriteModels', false)
                setInput({ useFavoriteModels: false })
              }
            }}
            checked={input.useFavoriteModels}
          />
        </Section>
      ) : null}
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Enable karras
            <Tooltip left="-20" width="240px">
              Denoising magic. Dramatically improves image generation using
              fewer steps. (Not all workers support this yet)
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <Switch
          onChange={() => {
            if (!input.karras) {
              PromptInputSettings.set('karras', true)
              setInput({ karras: true })
            } else {
              PromptInputSettings.set('karras', false)
              setInput({ karras: false })
            }
          }}
          checked={input.karras}
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
      {showNumImagesInput && (
        <div className="mt-8 w-full md:w-1/2">
          <Section>
            <div className="flex flex-row items-center justify-between">
              <SubSectionTitle>
                Number of images
                <div className="block text-xs w-full">
                  (1 - {MAX_IMAGES_PER_JOB})
                </div>
              </SubSectionTitle>
              <NumberInput
                // @ts-ignore
                className="mb-2"
                error={errorMessage.numImages}
                type="text"
                min={1}
                max={MAX_IMAGES_PER_JOB}
                name="numImages"
                onMinusClick={() => {
                  const value = input.numImages - 1
                  PromptInputSettings.set('numImages', value)
                  setInput({ numImages: value })
                }}
                onPlusClick={() => {
                  const value = input.numImages + 1
                  PromptInputSettings.set('numImages', value)
                  setInput({ numImages: value })
                }}
                onChange={handleChangeInput}
                onBlur={(e: any) => {
                  if (
                    isNaN(e.target.value) ||
                    e.target.value < 1 ||
                    e.target.value > MAX_IMAGES_PER_JOB
                  ) {
                    if (initialLoad) {
                      return
                    }

                    setErrorMessage({
                      numImages: `Please enter a valid number between 1 and ${MAX_IMAGES_PER_JOB}`
                    })
                  } else if (errorMessage.numImages) {
                    setErrorMessage({ numImages: null })
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
                max={MAX_IMAGES_PER_JOB}
                onChange={(e: any) => {
                  const event = {
                    target: {
                      name: 'numImages',
                      value: e.target.value
                    }
                  }

                  handleChangeInput(event)
                }}
              />
            </div>
            {errorMessage.numImages && (
              <div className="mb-2 text-red-500 text-lg font-bold">
                {errorMessage.numImages}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}

export default AdvancedOptionsPanel
