import { IconSettings } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import DropdownOptions from 'app/_modules/DropdownOptions'
import { Button } from 'components/UI/Button'
import Checkbox from 'components/UI/Checkbox'
import Samplers from 'models/Samplers'
import { useState } from 'react'
import { GetSetPromptInput } from 'types/artbot'
import { SourceProcessing } from 'types/horde'

interface SelectSamplerProps extends GetSetPromptInput {
  hideOptions?: boolean
}

export default function SelectSampler({
  hideOptions = false,
  input,
  setInput
}: SelectSamplerProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>Sampler</SubSectionTitle>
      {(input.source_processing === SourceProcessing.InPainting &&
        input.models[0] === 'stable_diffusion_inpainting') ||
      (input.source_image && input.control_type !== '') ? (
        <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
          Note: Sampler disabled when controlnet or inpainting model is used.
        </div>
      ) : (
        <>
          <FlexRow style={{ columnGap: '4px', position: 'relative' }}>
            <Select
              isDisabled={input.useAllSamplers}
              options={Samplers.dropdownOptions({
                model: input.models[0],
                isImg2Img: input.source_image
              })}
              onChange={(obj: { value: string; label: string }) => {
                // PromptInputSettings.set('sampler', obj.value)
                setInput({ sampler: obj.value })
              }}
              value={
                input.useAllSamplers
                  ? { label: 'Use all samplers', value: '' }
                  : Samplers.dropdownValue(input.sampler)
              }
            />
            {showDropdown && (
              <DropdownOptions
                handleClose={() => setShowDropdown(false)}
                title="Sampler options"
                top="46px"
              >
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Use all samplers?"
                    checked={input.useAllSamplers}
                    onChange={(bool: boolean) => {
                      setInput({ useAllSamplers: bool })
                    }}
                  />
                </div>
              </DropdownOptions>
            )}
            {!hideOptions && (
              <Button onClick={() => setShowDropdown(true)}>
                <IconSettings />
              </Button>
            )}
          </FlexRow>
          {input.useAllSamplers && (
            <div style={{ fontSize: '12px', paddingTop: '4px' }}>
              Note: Disabled when &quot;use all samplers&quot; is selected
            </div>
          )}
        </>
      )}
    </div>
  )
}
