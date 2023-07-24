/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useStore } from 'statery'
// import Switch from 'react-switch'

// UI component imports
import Input from 'components/UI/Input'
import Linker from 'components/UI/Linker'
import Section from 'app/_components/Section'
import SplitPanel from 'components/UI/SplitPanel'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextButton from 'components/UI/TextButton'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import TwoPanel from 'components/UI/TwoPanel'

// Utils imports
import { maxSteps } from 'utils/validationUtils'
import { SourceProcessing } from 'utils/promptUtils'

// Local imports
import ControlNetOptions from './ControlNetOptions'
import HiresFix from './HiresFix'
import InputSwitch from './InputSwitch'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import UpscalerOptions from './UpscalerOptions'

// Store imports
import { userInfoStore } from 'store/userStore'

// Hook imports
import useComponentState from 'hooks/useComponentState'

// Model imports
import AppSettings from 'models/AppSettings'
import PromptInputSettings from 'models/PromptInputSettings'

// Other imports
import ParentImage from 'app/_components/ParentImage'
import AllowNsfwImages from './AllowNsfwImages'
import ReplacementFilterToggle from './ReplacementFilterToggle'
import LoraSelect from 'modules/LoraSelect'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
import SelectModelDetails from 'modules/AdvancedOptions/ModelDetails/modelDetails'
import ImageOrientationOptions from 'app/_modules/AdvancedOptionsPanel/ImageOrientationOptions'
import Seed from './Seed'
import SelectSampler from './SelectSampler'
import ImageCount from './ImageCount'
import PostProcessors from './PostProcessors'
import Guidance from './Guidance'

const NoSliderSpacer = styled.div`
  height: 14px;
  margin-bottom: 16px;
`

interface Props {
  input: any
  setInput: any
}

const AdvancedOptionsPanel = ({ input, setInput }: Props) => {
  const handleChangeInput = (event: any) => {
    setInput({ [event.target.name]: event.target.value })
  }

  // const [filterNsfwModels, setFilterNsfwModels] = useState(false)
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [componentState, setComponentState] = useComponentState({
    isNegativePromptLibraryPanelOpen: false,
    favoriteModelsCount: 0
  })

  useEffect(() => {
    const favModels = AppSettings.get('favoriteModels') || {}
    const favoriteModelsCount = Object.keys(favModels).length

    setComponentState({ favoriteModelsCount })
  }, [componentState.showMultiModel, setComponentState])

  return (
    <div>
      {input.parentJobId && (
        <Section>
          <div className="flex flex-row w-full gap-2">
            <ParentImage parentJobId={input.parentJobId} />
            <div className="flex flex-col gap-2">
              <SubSectionTitle>Attached to previous job</SubSectionTitle>
              <div className="text-xs">
                This job will be associated with an{' '}
                <Linker href={`/job/${input.parentJobId}`}>existing job</Linker>
                .
              </div>
              <TextButton
                onClick={() => {
                  PromptInputSettings.delete('parentJobId')
                  setInput({
                    parentJobId: ''
                  })
                }}
              >
                Remove attachment?
              </TextButton>
            </div>
          </div>
        </Section>
      )}
      <FlexibleRow>
        <FlexibleUnit>
          <SelectSampler input={input} setInput={setInput} />
        </FlexibleUnit>
        <FlexibleUnit>
          <ImageCount input={input} setInput={setInput} />
        </FlexibleUnit>
      </FlexibleRow>
      <FlexibleRow>
        <FlexibleUnit>
          <SelectModel input={input} setInput={setInput} />
          <SelectModelDetails
            models={input.models}
            multiModels={input.useAllModels || input.useFavoriteModels}
          />
        </FlexibleUnit>
        <FlexibleUnit>
          <ImageOrientationOptions input={input} setInput={setInput} />
        </FlexibleUnit>
      </FlexibleRow>
      <FlexibleRow>
        <FlexibleUnit>
          {/* TODO: Handle multi-steps, (e.g., disable this field and have mutliple guidance values way down below.)  */}
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
            fullWidth
            enforceStepValue
          />
        </FlexibleUnit>
        <FlexibleUnit>
          {/* TODO: Handle multi-guidance (e.g., disable this field and have mutliple guidance values way down below.) */}
          <Guidance input={input} setInput={setInput} />
        </FlexibleUnit>
      </FlexibleRow>
      <FlexibleRow>
        <FlexibleUnit>
          <Seed input={input} setInput={setInput} />
        </FlexibleUnit>
        <FlexibleUnit>
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
        </FlexibleUnit>
      </FlexibleRow>

      <TwoPanel className="mt-4">
        <SplitPanel>
          {input.useMultiSteps && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Multi-steps
                      <TooltipComponent tooltipId="multi-steps">
                        Comma separated values to create a series of images
                        using multiple steps. Example: 3,6,9,12,15
                      </TooltipComponent>
                    </TextTooltipRow>
                    <div className="block w-full text-xs">
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
              <NoSliderSpacer />
            </Section>
          )}

          {false && (
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
          {input.useMultiGuidance && (
            <Section>
              <div className="flex flex-row items-center justify-between">
                <div className="w-[220px] pr-2">
                  <SubSectionTitle>
                    <TextTooltipRow>
                      Guidance
                      <TooltipComponent tooltipId="guidance-tooltip">
                        Comma separated values to create a series of images
                        using multiple steps. Example: 3,6,9,12,15
                      </TooltipComponent>
                    </TextTooltipRow>
                    <div className="block w-full text-xs">(1 - 30)</div>
                  </SubSectionTitle>
                </div>
                <Input
                  // @ts-ignore
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
              <NoSliderSpacer />
            </Section>
          )}

          {false && (
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
      {/* <InputSwitch
        label="Tiling"
        disabled={input.source_image ? true : false}
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
      /> */}
      {/* {input.source_processing !== SourceProcessing.OutPainting &&
        !input.useAllModels &&
        !componentState.showMultiModel &&
        !input.useFavoriteModels && (
          <SelectModel
            input={input}
            modelerOptions={modelerOptions}
            setInput={setInput}
          />
        )} */}
      {/* <div className="mt-2 flex flex-row items-center gap-2 text-[700] text-sm">
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
      </div> */}
      <LoraSelect input={input} setInput={setInput} />
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
      <Section></Section>
      <FlexibleRow>
        <FlexibleUnit>
          <PostProcessors input={input} setInput={setInput} />
        </FlexibleUnit>
        <FlexibleUnit>
          <UpscalerOptions input={input} setInput={setInput} />
        </FlexibleUnit>
      </FlexibleRow>
      <AllowNsfwImages />
      <ReplacementFilterToggle />
    </div>
  )
}

export default AdvancedOptionsPanel
