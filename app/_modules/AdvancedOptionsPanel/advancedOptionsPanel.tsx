/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from 'react'
// import Switch from 'react-switch'

// UI component imports
import Linker from 'app/_components/Linker'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'

// Local imports
import ControlNetOptions from './ControlNetOptions'

// Hook imports
import useComponentState from 'app/_hooks/useComponentState'

// Model imports
import AppSettings from 'app/_data-models/AppSettings'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'

// Other imports
import ParentImage from 'app/_components/ParentImage'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import Accordion from 'app/_components/Accordion'
import AccordionItem from 'app/_components/AccordionItem'
import Panel from 'app/_components/Panel'
import Denoise from './Denoise'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { SourceProcessing } from '_types/horde'
import { IconTrash } from '@tabler/icons-react'
import TextButton from 'app/_components/TextButton'
import ImageSquare from '../ImageSquare'
import { useInput } from '../InputProvider/context'

const AdvancedOptionsPanel = () => {
  const { input, setInput } = useInput()

  const [componentState, setComponentState] = useComponentState({
    isNegativePromptLibraryPanelOpen: false,
    favoriteModelsCount: 0
  })

  useEffect(() => {
    const favModels = AppSettings.get('favoriteModels') || {}
    const favoriteModelsCount = Object.keys(favModels).length

    setComponentState({ favoriteModelsCount })
  }, [componentState.showMultiModel, setComponentState])

  let title = 'img2img options'

  if (input.control_type) {
    title = 'ControlNet options'
  }

  if (input.source_mask) {
    title = 'inpainting options'
  }

  return (
    <div>
      {input.parentJobId && (
        <Section mb={4}>
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
            overflow: 'unset',
            padding: '8px'
          }}
        >
          <Accordion>
            <AccordionItem
              title={
                <FlexRow style={{ justifyContent: 'space-between' }}>
                  <SubSectionTitle style={{ paddingBottom: '0' }}>
                    {title}
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
                    <ControlNetOptions />
                  </FlexibleUnit>
                  <FlexibleUnit>
                    <Denoise />
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
                          source_mask: '',
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
    </div>
  )
}

export default AdvancedOptionsPanel
