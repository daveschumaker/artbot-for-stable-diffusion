import ReactSwitch from 'react-switch'
import { trackEvent } from '../../../../api/telemetry'
import DefaultPromptInput from '../../../../models/DefaultPromptInput'
import PromptInputSettings from '../../../../models/PromptInputSettings'
import { SourceProcessing } from '../../../../utils/promptUtils'
import MaxWidth from '../../../UI/MaxWidth'
import Section from '../../../UI/Section'
import SelectComponent from '../../../UI/Select'
import SubSectionTitle from '../../../UI/SubSectionTitle'
import TextTooltipRow from '../../../UI/TextTooltipRow'
import Tooltip from '../../../UI/Tooltip'
import { samplerOptions } from './samplers.controller'

interface IProps {
  input: DefaultPromptInput
  setInput: (obj: any) => void
  showMultiModel?: boolean
}

const Samplers = ({ input, setInput, showMultiModel = false }: IProps) => {
  const samplerValue = samplerOptions(input).filter((option) => {
    return input.sampler === option.value
  })[0]

  const showAllSamplersInput =
    input.source_processing !== SourceProcessing.Img2Img &&
    input.source_processing !== SourceProcessing.InPainting &&
    !input.useAllModels &&
    !input.useFavoriteModels &&
    !showMultiModel

  return (
    <>
      {input.multiState !== 'samplers' && (
        <Section>
          <SubSectionTitle>Sampler</SubSectionTitle>
          {(input.source_processing === SourceProcessing.InPainting &&
            input.models[0] === 'stable_diffusion_inpainting') ||
            (input.source_image && input.control_type !== '') ? (
            <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
              Note: Sampler disabled when controlnet or inpainting model is
              used.
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
              <Tooltip tooltipId="use-all-samplers-tooltip">
                Automatically generate an image for sampler
              </Tooltip>
            </TextTooltipRow>
          </SubSectionTitle>
          <ReactSwitch
            disabled={
              !!input.multiState && input.multiState !== 'samplers'
            }
            onChange={() => {
              if (input.multiState !== 'samplers') {
                trackEvent({
                  event: 'USE_ALL_SAMPLERS_CLICK',
                  context: '/pages/index'
                })
                setInput({
                  numImages: 1,
                  multiState: 'samplers'
                })

                PromptInputSettings.set('numImages', 1)
                PromptInputSettings.set('multiState', 'samplers')
              } else {
                PromptInputSettings.set('multiState', '')
                setInput({ multiState: '' })
              }
            }}
            checked={input.multiState === 'samplers'}
          />
        </Section>
      )}
    </>
  )
}

export default Samplers
