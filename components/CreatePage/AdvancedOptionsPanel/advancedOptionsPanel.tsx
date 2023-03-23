/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useStore } from 'statery'
import Switch from 'react-switch'

// UI component imports
import {Button} from 'components/UI/Button'
import Checkbox from 'components/UI/Checkbox'
import FlexRow from 'components/UI/FlexRow'
import Input from 'components/UI/Input'
import Linker from 'components/UI/Linker'
import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SelectComponent from 'components/UI/Select'
import SplitPanel from 'components/UI/SplitPanel'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TextArea from 'components/UI/TextArea'
import TextButton from 'components/UI/TextButton'
import TextTooltipRow from 'components/UI/TextTooltipRow'
import Tooltip from 'components/UI/Tooltip'
import TwoPanel from 'components/UI/TwoPanel'

// Icon imports
import ArrowBarLeftIcon from '../../icons/ArrowBarLeftIcon'
import GrainIcon from '../../icons/GrainIcon'

// Utils imports
import { maxSteps } from 'utils/validationUtils'
import { SourceProcessing } from 'utils/promptUtils'
import { validModelsArray } from 'utils/modelUtils'
import { db, getDefaultPrompt, setDefaultPrompt } from 'utils/db'

// Local imports
import ControlNetOptions from './ControlNetOptions'
import HiresFix from './HiresFix'
import InputSwitch from './InputSwitch'
import NumericInputSlider from './NumericInputSlider'
import OrientationOptions from './OrientationOptions'
import Samplers from './Samplers'
import SelectModel from './SelectModel'
import UpscalerOptions from './UpscalerOptions'

// Store imports
import { userInfoStore } from 'store/userStore'

// Hook imports
import useComponentState from 'hooks/useComponentState'
import useErrorMessage from 'hooks/useErrorMessage'

// Model imports
import AppSettings from 'models/AppSettings'
import PromptInputSettings from 'models/PromptInputSettings'

// Other imports
import NegativePrompts from '../NegativePrompts'
import { trackEvent } from 'api/telemetry'
import { MAX_IMAGES_PER_JOB } from '_constants'


const NoSliderSpacer = styled.div`
  height: 14px;
  margin-bottom: 16px;
`

interface Props {
  handleChangeInput: any
  input: any
  setInput: any
  setHasValidationError: any
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  input,
  setInput,
  setHasValidationError
}: Props) => {
  const [filterNsfwModels, setFilterNsfwModels] = useState(false)
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState
  const [errorMessage, setErrorMessage, hasError] = useErrorMessage()

  const [componentState, setComponentState] = useComponentState({
    showMultiModel: PromptInputSettings.get('showMultiModel') || false,
    isNegativePromptLibraryPanelOpen: false,
    favoriteModelsCount: 0
  })
  const [initialLoad, setInitialLoad] = useState(true)

  const modelerOptions = (imageParams: any) => {
    const modelsArray =
      validModelsArray({ imageParams, filterNsfw: filterNsfwModels }) || []
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
    } catch (err) {}
  }, [input.negative])

  const getPostProcessing = useCallback(
    (value: string) => {
      return input.post_processing.indexOf(value) >= 0
    },
    [input.post_processing]
  )

  const handlePostProcessing = useCallback(
    (value: string) => {
      let newPost = [...input.post_processing]
      const index = newPost.indexOf(value)

      if (index > -1) {
        newPost.splice(index, 1)
      } else {
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
    const favModels = AppSettings.get('favoriteModels') || {}
    const favoriteModelsCount = Object.keys(favModels).length

    setComponentState({ favoriteModelsCount })
  }, [input, setComponentState])

  // Dynamically display various options

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
    input.source_processing !== SourceProcessing.OutPainting

  const showUseAllModelsInput =
    !input.useMultiSteps &&
    !input.useAllSamplers &&
    !componentState.showMultiModel &&
    !input.useFavoriteModels &&
    input.source_processing !== SourceProcessing.InPainting &&
    input.source_processing !== SourceProcessing.OutPainting

  const showUseFavoriteModelsInput =
    !input.useMultiSteps &&
    !input.useAllSamplers &&
    !componentState.showMultiModel &&
    !input.useAllModels &&
    input.source_processing !==
      (SourceProcessing.InPainting || SourceProcessing.OutPainting)

  const showNumImagesInput =
    !input.useAllModels && !input.useMultiSteps && !input.useAllSamplers

  return (
    <div>
      {componentState.isNegativePromptLibraryPanelOpen && (
        <NegativePrompts
          open={componentState.isNegativePromptLibraryPanelOpen}
          handleClosePane={() => setComponentState({ isNegativePromptLibraryPanelOpen: false })}
          setInput={setInput}
        />
      )}
      {input.parentJobId && (
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

              PromptInputSettings.delete('parentJobId')
              setInput({
                parentJobId: ''
              })
            }}
          >
            Remove attachment?
          </TextButton>
        </Section>
      )}
      <OrientationOptions
        input={input}
        setInput={setInput}
      />
      <Section>
        <SubSectionTitle>
          <TextTooltipRow>
            Negative prompt
            <Tooltip tooltipId="negative-prompt-tooltip">
              Add words or phrases to demphasize from your desired image
            </Tooltip>
          </TextTooltipRow>
        </SubSectionTitle>
        <FlexRow>
          <TextArea
            name="negative"
            placeholder="Words to deemphasize from image"
            onChange={handleChangeInput}
            value={input.negative}
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
            <ArrowBarLeftIcon />
          </Button>
        </FlexRow>
        <FlexRow>
          <TextButton onClick={clearNegPrompt}>clear default</TextButton>
          <TextButton onClick={handleSaveNeg}>save as default</TextButton>
          <TextButton onClick={() => setComponentState({ isNegativePromptLibraryPanelOpen: true })}>
            load
          </TextButton>
        </FlexRow>
      </Section>
      <Samplers
        input={input}
        setInput={setInput}
        showMultiModel={componentState.showMultiModel}
      />
      <TwoPanel className="mt-4">
        <SplitPanel>

          {!input.useMultiSteps && (
            <NumericInputSlider
              label="Steps"
              tooltip="Fewer steps generally result in quicker image generations.
              Many models achieve full coherence after a certain number
              of finite steps (60 - 90). Keep your initial queries in
              the 30 - 50 range for best results."
              from={1}
              to={maxSteps({
                sampler: input.sampler,
                loggedIn: loggedIn === true ? true : false,
                isSlider: true
              })}
              step={1}
              input={input}
              setInput={setInput}
              fieldName="steps"
              initialLoad={initialLoad}
              fullWidth
              enforceStepValue
            />
          )}
          {input.useMultiSteps && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Multi-steps
                      <Tooltip tooltipId="multi-steps">
                        Comma separated values to create a series of images
                        using multiple steps. Example: 3,6,9,12,15
                      </Tooltip>
                    </TextTooltipRow>
                    <div className="block text-xs w-full">
                      (1 -{' '}
                      {maxSteps({
                        sampler: input.sampler,
                        loggedIn: loggedIn === true ? true : false
                      })}
                      )
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
            <InputSwitch
              disabled={
                input.useMultiGuidance || input.useAllSamplers ? true : false
              }
              label="Use multiple steps"
              tooltip={`Provide a list of comma separated values to create a series of images using multiple steps: &quot;3,6,9,12,15&quot;`}
              handleSwitchToggle={() => {
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
          )}

        </SplitPanel>

        <SplitPanel>

          {!input.useMultiGuidance && (
            <NumericInputSlider
              label="Guidance"
              tooltip="Higher numbers follow the prompt more closely. Lower
                numbers give more creativity."
              from={1}
              to={30}
              step={0.5}
              input={input}
              setInput={setInput}
              fieldName="cfg_scale"
              initialLoad={initialLoad}
              fullWidth
            />
          )}
          {input.useMultiGuidance && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Guidance
                      <Tooltip tooltipId="guidance-tooltip">
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
            <InputSwitch
              label="Use multiple guidance"
              tooltip='Provide a list of comma separated values to create a series of images using multiple guidance: "3,6,9,12,15"'
              disabled={
                input.useMultiSteps || input.useAllSamplers ? true : false
              }
              handleSwitchToggle={() => {
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
          )}
          
        </SplitPanel>
      </TwoPanel>
      {(input.img2img ||
        input.source_processing === SourceProcessing.Img2Img ||
        input.source_processing === SourceProcessing.InPainting) && (
        <div className="mr-8">
          <Section>
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
              initialLoad={initialLoad}
              disabled={
                input.models &&
                input.models[0] &&
                input.models[0].indexOf('_inpainting') >= 0
              }
            />
            {input.source_processing === SourceProcessing.InPainting &&
              input.models &&
              input.models[0] &&
              input.models[0].indexOf('_inpainting') >= 0 && (
                <div className="mt-0 text-sm text-slate-500">
                  Note: Denoise disabled when inpainting model is used.
                </div>
              )}
          </Section>
        </div>
      )}

      <ControlNetOptions input={input} setInput={setInput} />

      <InputSwitch
        label="Tiling"
        disabled={input.source_image}
        tooltip="Attempt to create seamless, repeatable textures. Note: This will not work for img2img or inpainting requests."
        handleSwitchToggle={() => {
          if (!input.tiling) {
            setInput({ tiling: true })
          } else {
            setInput({ tiling: false })
          }
        }}
        checked={input.tiling}
        moreInfoLink={
          input.source_image ? (
            <div className="text-slate-500 dark:text-slate-400">
              This option cannot be used with img2img requests.
            </div>
          ) : null
        }
      />
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
              title="Insert random seed"
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
              title="Clear"
              onClick={() => {
                PromptInputSettings.set('seed', '')
                setInput({ seed: '' })
              }}
            >
              <ArrowBarLeftIcon />
            </Button>
          </div>
        </MaxWidth>
      </Section>
      {input.source_processing !== SourceProcessing.OutPainting &&
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
            <Tooltip tooltipId="select-models-tooltip">
              Models currently available within the horde. Numbers in
              parentheses indicate number of works. Generally, these models will
              generate images quicker.
            </Tooltip>
            <div className="text-xs">
              <Linker href={`/info/models#${input.models[0]}`}>
                [ View detailed model info ]
              </Linker>
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
      <div className="mt-2 flex flex-row items-center gap-2 text-[700] text-sm">
        Filter out NSFW models?{' '}
        <Switch
          checked={filterNsfwModels}
          onChange={() => {
            if (filterNsfwModels) {
              AppSettings.set('filterNsfwModels', false)
              setFilterNsfwModels(false)
            } else {
              AppSettings.set('filterNsfwModels', true)
              setFilterNsfwModels(true)
            }
          }}
        />
      </div>
      {showMultiModelSelect && (
        <InputSwitch
          label="Multi-model select"
          tooltip="Pick from multiple models that you might prefer."
          handleSwitchToggle={() => {
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
      )}
      {showUseAllModelsInput && (
        <InputSwitch
          label={`Use all available models (${
            modelerOptions(input).length - 1
          })`}
          tooltip="Automatically generate an image for each model currently available on Stable Horde"
          moreInfoLink={
            <Linker href="/info/models">[ View all model details ]</Linker>
          }
          handleSwitchToggle={() => {
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
      )}
      {showUseFavoriteModelsInput && (
        <InputSwitch
          label={`Use favorite models (${componentState.favoriteModelsCount})`}
          tooltip="Automatically generate an image for each model you have favorited."
          moreInfoLink={
            <Linker href="/info/models?show=favorite-models">
              [ View favorite models ]
            </Linker>
          }
          disabled={componentState.favoriteModelsCount === 0 ? true : false}
          handleSwitchToggle={() => {
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
      )}
      <InputSwitch
        label="Enable karras"
        tooltip="Denoising magic. Dramatically improves image generation using fewer steps."
        moreInfoLink={
          input.source_image &&
          input.control_type && (
            <div className="mt-[-4px] text-xs text-slate-500 dark:text-slate-400 font-[600]">
              <strong>Note:</strong> Cannot be used for ControlNet requests
            </div>
          )
        }
        disabled={input.source_image && input.control_type ? true : false}
        handleSwitchToggle={() => {
          if (!input.karras) {
            setInput({ karras: true })
          } else {
            setInput({ karras: false })
          }
        }}
        checked={input.karras}
      />
      <HiresFix input={input} setInput={setInput} />

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
              initialLoad={initialLoad}
            />
          )}
          <Checkbox
            label={`Strip background`}
            value={getPostProcessing(`strip_background`)}
            onChange={() => handlePostProcessing(`strip_background`)}
          />
          <UpscalerOptions input={input} setInput={setInput} />
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
          initialLoad={initialLoad}
          enforceStepValue
        />
      </Section>
      {showNumImagesInput && (
        <Section>
          <NumericInputSlider
            label="Number of images"
            from={1}
            to={MAX_IMAGES_PER_JOB}
            step={1}
            input={input}
            setInput={setInput}
            fieldName="numImages"
            initialLoad={initialLoad}
            enforceStepValue
          />
        </Section>
      )}
    </div>
  )
}

export default AdvancedOptionsPanel
