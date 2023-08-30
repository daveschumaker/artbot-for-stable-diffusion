/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
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

// Local imports
import ControlNetOptions from './ControlNetOptions'
import InputSwitch from './InputSwitch'
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
import LoraSelect from './LoraSelect'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
import ImageOrientationOptions from 'app/_modules/AdvancedOptionsPanel/ImageOrientationOptions'
import Seed from './Seed'
import SelectSampler from './SelectSampler'
import ImageCount from './ImageCount'
import PostProcessors from './PostProcessors'
import Guidance from './Guidance'
import Steps from './Steps'
import MiscOptions from './MiscOptions'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import Panel from 'app/_components/Panel'
import ClipSkip from './ClipSkip'
import Denoise from './Denoise'
import FlexRow from 'app/_components/FlexRow'
import ImageSquare from 'components/ImageSquare'
import { Button } from 'components/UI/Button'
import { SourceProcessing } from 'types/horde'
import { IconTrash } from '@tabler/icons-react'
import EmbeddingsSelect from './EmbeddingsSelect'

interface Props {
  input: any
  setInput: any
  setErrors: any
}

const AdvancedOptionsPanel = ({ input, setInput, setErrors }: Props) => {
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

      {input.source_image && (
        <Panel
          style={{
            borderWidth: '1px',
            marginBottom: '12px',
            overflow: 'unset'
          }}
        >
          <Accordion>
            <AccordionItem
              title={
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <SubSectionTitle style={{ paddingBottom: '0' }}>
                    img2img options
                  </SubSectionTitle>
                  <div>
                    <ImageSquare
                      imageDetails={{
                        ...input,
                        ...{ base64String: input.source_image, thumbnail: '' }
                      }}
                      imageType={input.imageType}
                      size={24}
                    />
                  </div>
                </FlexRow>
              }
            >
              <>
                <FlexibleRow style={{ marginBottom: 0, paddingTop: '8px' }}>
                  <FlexibleUnit>
                    <ControlNetOptions input={input} setInput={setInput} />
                  </FlexibleUnit>
                  <FlexibleUnit>
                    <Denoise input={input} setInput={setInput} />
                  </FlexibleUnit>
                </FlexibleRow>
                <FlexibleRow style={{ marginBottom: 0, paddingTop: '8px' }}>
                  <FlexibleUnit></FlexibleUnit>
                  <FlexibleUnit style={{ alignItems: 'flex-end' }}>
                    <Button
                      theme="secondary"
                      onClick={() => {
                        setInput({
                          img2img: false,
                          imageType: '',
                          source_image: '',
                          source_processing: SourceProcessing.Prompt
                        })
                        localStorage.removeItem('img2img_base64')
                      }}
                      style={{ maxWidth: '50%' }}
                    >
                      <IconTrash stroke={1.5} />
                      Remove image
                    </Button>
                  </FlexibleUnit>
                </FlexibleRow>
              </>
            </AccordionItem>
          </Accordion>
        </Panel>
      )}

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
          </FlexibleUnit>
          <FlexibleUnit>
            <ImageOrientationOptions input={input} setInput={setInput} />
          </FlexibleUnit>
        </FlexibleRow>
      </Section>

      <Section>
        <FlexibleRow>
          <FlexibleUnit>
            <Steps input={input} setInput={setInput} />
          </FlexibleUnit>
          <FlexibleUnit>
            <Guidance input={input} setInput={setInput} />
          </FlexibleUnit>
        </FlexibleRow>
      </Section>

      <Section>
        <FlexibleRow>
          <FlexibleUnit>
            <Seed input={input} setInput={setInput} />
          </FlexibleUnit>
          <FlexibleUnit>
            <ClipSkip input={input} setInput={setInput} />
          </FlexibleUnit>
        </FlexibleRow>
      </Section>

      <TwoPanel className="mt-4">
        <SplitPanel>
          {false && (
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
      <Section style={{ paddingBottom: '12px' }}>
        <LoraSelect input={input} setInput={setInput} setErrors={setErrors} />
      </Section>

      <Section style={{ paddingBottom: '12px' }}>
        <EmbeddingsSelect
          input={input}
          setInput={setInput}
          setErrors={setErrors}
        />
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
    </div>
  )
}

export default AdvancedOptionsPanel
