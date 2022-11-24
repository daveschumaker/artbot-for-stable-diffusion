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
import { ModelDetails } from '../../../types'
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
import { modelInfoStore } from '../../../store/modelStore'
import Checkbox from '../../UI/Checkbox'
import { MAX_IMAGES_PER_JOB } from '../../../constants'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
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

interface MaxWidthProps {
  maxWidth?: number
}

const MaxWidth = styled.div<MaxWidthProps>`
  width: 100%;

  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth}px;
  `}
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

const modelerOptions = (models: Array<ModelDetails>) => {
  const modelsArray = []
  models.forEach((model) => {
    modelsArray.push({
      value: model.name,
      label: `${model.name} (${model.count})`
    })
  })

  if (!models || models?.length === 0) {
    modelsArray.push({ value: 'stable_diffusion', label: 'stable_diffusion' })
  } else {
    modelsArray.push({ value: 'random', label: 'Random!' })
  }

  return modelsArray
}

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
  const modelState = useStore(modelInfoStore)
  const { availableModels, modelDetails } = modelState
  const { loggedIn } = userState

  const [errorMessage, setErrorMessage, hasError] = useErrorMessage()
  const [showMultiModel, setShowMultiModel] = useState(false)
  const [showNegPane, setShowNegPane] = useState(false)

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]

  // @ts-ignore
  const modelsValue = modelerOptions(availableModels).filter((option) => {
    return input?.models?.indexOf(option.value) >= 0
  })

  const samplerValue = samplerOptions(input).filter((option) => {
    return input.sampler === option.value
  })[0]

  const validateSteps = useCallback(() => {
    if (
      isNaN(input.steps) ||
      input.steps < 1 ||
      input.steps > maxSteps(input.sampler, loggedIn)
    ) {
      setErrorMessage({
        steps: `Please enter a valid number between 1 and ${maxSteps(
          input.sampler,
          loggedIn
        )}`
      })
    } else {
      setErrorMessage({ steps: null })
    }
  }, [input.sampler, input.steps, loggedIn, setErrorMessage])

  const clearNegPrompt = () => {
    setDefaultPrompt('')
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
    } catch (err) {}
  }, [input.negative])

  const getSelectedTrigger = useCallback(
    (value: string) => {
      return input.triggers.indexOf(value) >= 0
    },
    [input.triggers]
  )

  const handleMultiTrigger = useCallback(
    (value: string) => {
      const newTriggers = [...input.triggers]

      const index = newTriggers.indexOf(value)
      if (index > -1) {
        newTriggers.splice(index, 1)
      } else {
        newTriggers.push(value)
      }

      setInput({ triggers: newTriggers })
    },
    [input.triggers, setInput]
  )

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
        if (value === 'RealESRGAN_x4plus') {
          setInput({ numImages: 1 })
        }
        newPost.push(value)
      }

      setInput({ post_processing: newPost })
    },
    [input.post_processing, setInput]
  )

  useEffect(() => {
    setHasValidationError(hasError)
  }, [hasError, setHasValidationError])

  useEffect(() => {
    validateSteps()
  }, [input.sampler, validateSteps])

  return (
    <div>
      {showNegPane ? (
        <NegativePrompts
          open={showNegPane}
          handleClosePane={() => setShowNegPane(false)}
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
              handleOrientationSelect(obj.value)
              setInput({ orientationType: obj.value, height: 512, width: 512 })

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
                Max size for each dimension: {loggedIn ? 3072 : 1024} pixels
                {loggedIn && input.height * input.width > 1024 * 1024 && (
                  <div className="text-red-500 font-bold">
                    WARNING: You will need to have enough kudos to complete this
                    request.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 justify-start">
                <div className="mt-2 flex flex-row gap-4 items-center">
                  <SubSectionTitle>Width</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    type="text"
                    name="width"
                    error={errorMessage.width}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value > (loggedIn ? 3072 : 1024)
                      ) {
                        setErrorMessage({
                          width: `Please enter a valid number between 64 and ${
                            loggedIn ? 3072 : 1024
                          }`
                        })
                        return
                      }

                      if (errorMessage.width) {
                        setErrorMessage({ width: null })
                      }

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
                  <SubSectionTitle>Height</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    name="height"
                    error={errorMessage.height}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value > (loggedIn ? 3072 : 1024)
                      ) {
                        setErrorMessage({
                          height: `Please enter a valid number between 64 and ${
                            loggedIn ? 3072 : 1024
                          }`
                        })
                        return
                      }

                      if (errorMessage.height) {
                        setErrorMessage({ height: null })
                      }

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
          Negative prompt
          <Tooltip width="180px">
            Add words or phrases to demphasize from your desired image
          </Tooltip>
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
              return setInput({
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
          <TextButton onClick={() => setShowNegPane(true)}>load</TextButton>
        </FlexRow>
      </Section>
      <Section>
        <SubSectionTitle>Sampler</SubSectionTitle>
        {input.source_processing === SourceProcessing.InPainting ? (
          <div className="mt-2 text-sm text-slate-500">
            Note: Sampler disabled when inpainting is used.
          </div>
        ) : (
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <SelectComponent
              options={samplerOptions(input)}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ sampler: obj.value })
                localStorage.setItem('sampler', obj.value)
              }}
              isSearchable={false}
              value={samplerValue}
            />
          </MaxWidth>
        )}
      </Section>
      <Section>
        <SubSectionTitle>
          Steps
          <Tooltip width="200px">
            Fewer steps generally result in quicker image generations. Many
            models achieve full coherence after a certain number of finite steps
            (60 - 90). Keep your initial queries in the 30 - 50 range for best
            results.
          </Tooltip>
          <div className="block text-xs w-full">
            (1 - {maxSteps(input.sampler, loggedIn)})
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={errorMessage.steps}
            className="mb-2"
            type="text"
            name="steps"
            onChange={handleChangeInput}
            onBlur={() => {
              validateSteps()
            }}
            // @ts-ignore
            value={input.steps}
            width="100%"
          />
        </MaxWidth>
        {errorMessage.steps && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {errorMessage.steps}
          </div>
        )}
      </Section>
      <Section>
        <SubSectionTitle>
          Guidance
          <Tooltip width="200px">
            Higher numbers follow the prompt more closely. Lower numbers give
            more creativity.
          </Tooltip>
          <div className="block text-xs w-full">(1 - 30)</div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={errorMessage.cfg_scale}
            className="mb-2"
            type="text"
            name="cfg_scale"
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 30
              ) {
                setErrorMessage({
                  cfg_scale: 'Please enter a valid number between 1 and 30'
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
        </MaxWidth>
        {errorMessage.cfg_scale && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {errorMessage.cfg_scale}
          </div>
        )}
      </Section>
      {(input.img2img ||
        input.source_processing === SourceProcessing.Img2Img) && (
        <Section>
          <SubSectionTitle>
            Denoise{' '}
            <Tooltip width="200px">
              Amount of noise added to input image. Values that approach 1.0
              allow for lots of variations but will also produce images that are
              not semantically consistent with the input. Only available for
              img2img.
            </Tooltip>
            <div className="block text-xs w-full">(0.0 - 1.0)</div>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="120"
          >
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="denoising_strength"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.denoising_strength}
              width="100%"
            />
          </MaxWidth>
        </Section>
      )}
      <Section>
        <SubSectionTitle>
          Seed
          <Tooltip width="140px">Leave seed blank for random.</Tooltip>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
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
        </MaxWidth>
      </Section>
      {input.source_processing !==
        (SourceProcessing.InPainting || SourceProcessing.OutPaiting) &&
        !input.useAllModels &&
        !showMultiModel && (
          <Section>
            <SubSectionTitle>
              Model
              <Tooltip width="240px">
                Models currently available within the horde. Numbers in
                parentheses indicate number of works. Generally, these models
                will generate images quicker.
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
                menuPlacement={'top'}
                //@ts-ignore
                options={modelerOptions(availableModels)}
                onChange={(obj: { value: string; label: string }) => {
                  if (obj.value === 'stable_diffusion_2.0') {
                    setInput({ sampler: 'dpmsolver' })
                  }

                  setInput({ models: [obj.value] })
                }}
                // @ts-ignore
                value={modelsValue}
                isSearchable={false}
              />
            </MaxWidth>
            {modelDetails[input.models[0]]?.showcases && (
              <MaxWidth
                // @ts-ignore
                maxWidth="240"
                className="mt-2"
              >
                Example:
                <img
                  src={modelDetails[input.models[0]]?.showcases[0]}
                  alt="Model example"
                  width="240"
                  height="240"
                />
              </MaxWidth>
            )}
            <MaxWidth
              // @ts-ignore
              maxWidth="480"
            >
              {modelDetails[input.models[0]] && (
                <div className="mt-2 text-xs">
                  {modelDetails[input.models[0]].description &&
                    `${modelDetails[input.models[0]].description}`}
                  <br />
                  {modelDetails[input.models[0]].style &&
                    `Style: ${modelDetails[input.models[0]].style}`}{' '}
                  {modelDetails[input.models[0]].nsfw && ` (nsfw)`}
                  {Array.isArray(modelDetails[input.models[0]]?.trigger) &&
                  modelDetails[input.models[0]].trigger?.length === 1 ? (
                    <>
                      <br />
                      Trigger: &quot;
                      {
                        //@ts-ignore
                        modelDetails[input.models[0]]?.trigger[0]
                      }
                      &quot; (will be automatically added to your prompt)
                    </>
                  ) : null}
                </div>
              )}

              {Array.isArray(modelDetails[input.models[0]]?.trigger) &&
              // @ts-ignore
              modelDetails[input?.models[0]]?.trigger?.length > 1 ? (
                <div>
                  <div className="mt-2 text-md">Multi-trigger select</div>
                  <div className="text-xs">
                    This model allows you to mix and match multiple types of
                    triggers.
                  </div>
                  <div className="mb-2 text-xs">
                    Triggers will be automatically added to your prompt.
                  </div>
                  {
                    //@ts-ignore
                    modelDetails[input?.models[0]]?.trigger.map(
                      (trigger: string, i: any) => {
                        return (
                          <div key={`trigger_${i}`}>
                            <Checkbox
                              label={trigger}
                              value={getSelectedTrigger(trigger)}
                              onChange={() => handleMultiTrigger(trigger)}
                            />
                          </div>
                        )
                      }
                    )
                  }
                </div>
              ) : null}
            </MaxWidth>
          </Section>
        )}
      {!input.useAllModels ? (
        <Section>
          <SubSectionTitle>
            Multi-model select
            <Tooltip left="-140" width="240px">
              Pick from multiple models that you might prefer.
            </Tooltip>
          </SubSectionTitle>
          <Switch
            onChange={() => {
              if (!showMultiModel) {
                trackEvent({
                  event: 'USE_MULTI_MODEL_SELECT',
                  context: '/pages/index'
                })
                setShowMultiModel(true)
              } else {
                setShowMultiModel(false)
              }
            }}
            checked={showMultiModel}
          />
        </Section>
      ) : null}
      {showMultiModel ? (
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
              isMulti
              menuPlacement={'top'}
              //@ts-ignore
              options={modelerOptions(availableModels)}
              onChange={(obj: Array<{ value: string; label: string }>) => {
                const modelArray: Array<string> = []

                obj.forEach((model: { value: string; label: string }) => {
                  modelArray.push(model.value)
                })

                setInput({ models: [...modelArray] })
              }}
              // @ts-ignore
              value={modelsValue}
              isSearchable={false}
            />
          </MaxWidth>
        </Section>
      ) : null}
      {!showMultiModel ? (
        <Section>
          <SubSectionTitle>
            Use all available models ({availableModels.length})
            <Tooltip left="-140" width="240px">
              Automatically generate an image for each model currently available
              on Stable Horde
            </Tooltip>
          </SubSectionTitle>
          <Switch
            onChange={() => {
              if (!input.useAllModels) {
                trackEvent({
                  event: 'USE_ALL_MODELS_CLICK',
                  context: '/pages/index'
                })
                setInput({ useAllModels: true, post_processing: [] })
              } else {
                setInput({ useAllModels: false })
              }
            }}
            checked={input.useAllModels}
          />
        </Section>
      ) : null}
      <Section>
        <SubSectionTitle>
          Enable karras
          <Tooltip left="-20" width="240px">
            Denoising magic. Dramatically improves image generation using fewer
            steps. (Not all workers support this yet)
          </Tooltip>
        </SubSectionTitle>
        <Switch
          onChange={() => {
            if (!input.karras) {
              setInput({ karras: true })
            } else {
              setInput({ karras: false })
            }
          }}
          checked={input.karras}
        />
      </Section>
      {!input.useAllModels && (
        <Section>
          <SubSectionTitle>
            Post-processing
            <Tooltip left="-20" width="240px">
              Post-processing options such as face improvement and image
              upscaling.
            </Tooltip>
          </SubSectionTitle>
          <div className="flex flex-col gap-2 items-start">
            <Checkbox
              label={`GFPGAN (improves faces)`}
              value={getPostProcessing('GFPGAN')}
              onChange={() => handlePostProcessing('GFPGAN')}
            />
            <Checkbox
              label={`RealESRGAN_x4plus (upscaler - max 1 image)`}
              value={getPostProcessing(`RealESRGAN_x4plus`)}
              onChange={() => handlePostProcessing(`RealESRGAN_x4plus`)}
            />
          </div>
        </Section>
      )}
      {!input.useAllModels &&
        input.post_processing.indexOf('RealESRGAN_x4plus') === -1 &&
        !showMultiModel && (
          <Section>
            <SubSectionTitle>
              Number of images
              <div className="block text-xs w-full">
                (1 - {MAX_IMAGES_PER_JOB})
              </div>
            </SubSectionTitle>
            <MaxWidth
              // @ts-ignore
              maxWidth="120"
            >
              <Input
                // @ts-ignore
                className="mb-2"
                error={errorMessage.numImages}
                type="text"
                name="numImages"
                onChange={handleChangeInput}
                onBlur={(e: any) => {
                  if (
                    isNaN(e.target.value) ||
                    e.target.value < 1 ||
                    e.target.value > MAX_IMAGES_PER_JOB
                  ) {
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
            </MaxWidth>
            {errorMessage.numImages && (
              <div className="mb-2 text-red-500 text-lg font-bold">
                {errorMessage.numImages}
              </div>
            )}
          </Section>
        )}
    </div>
  )
}

export default AdvancedOptionsPanel
