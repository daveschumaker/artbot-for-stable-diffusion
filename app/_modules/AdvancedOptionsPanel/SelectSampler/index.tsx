import { IconSettings } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import Select from 'app/_components/Select'
import DropdownOptions from 'app/_modules/DropdownOptions'
import { Button } from 'app/_components/Button'
import Checkbox from 'app/_components/Checkbox'
import Samplers from 'app/_data-models/Samplers'
import { useState } from 'react'
import { SourceProcessing } from '_types/horde'
import { Value } from '_types'
import { useInput } from 'app/_modules/InputProvider/context'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import styles from './selectSampler.module.css'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

interface SamplerOption {
  value: string
  label: string
}

interface SelectSamplerProps {
  hideOptions?: boolean
}

export default function SelectSampler({
  hideOptions = false
}: SelectSamplerProps) {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)

  const multiSamplerOptions = input?.multiSamplers.map((value) => {
    return { value, label: value }
  })

  return (
    <OptionsRow>
      <OptionsRowLabel>Sampler</OptionsRowLabel>
      <FlexRow gap={4} style={{ position: 'relative' }}>
        {input.source_processing === SourceProcessing.InPainting &&
        input.models[0] === 'stable_diffusion_inpainting' ? (
          <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
            Note: Sampler disabled when inpainting model is used.
          </div>
        ) : (
          <>
            <Select
              isDisabled={input.useAllSamplers}
              options={Samplers.dropdownOptions({
                model: input.models[0],
                isImg2Img: input.source_image
              })}
              onChange={(obj: SamplerOption | SamplerOption[]) => {
                // isMulti mirrors input.useMultiSamplers, so react-select
                // passes an array exactly when useMultiSamplers is set.
                if (input.useMultiSamplers) {
                  const updateObject = (obj as SamplerOption[]).map(
                    (sampler) => sampler.value
                  )
                  setInput({ multiSamplers: updateObject })
                } else {
                  setInput({ sampler: (obj as SamplerOption).value })
                }
              }}
              isMulti={input.useMultiSamplers}
              value={
                input.useMultiSamplers
                  ? // A multi-select takes an array. The shared Select `value`
                    // prop is typed as a single Value (see _types/index.ts).
                    (multiSamplerOptions as unknown as Value)
                  : input.useAllSamplers
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
                    label="Use multiple samplers?"
                    checked={input.useMultiSamplers}
                    onChange={(bool: boolean) => {
                      const updateObject: Partial<DefaultPromptInput> = {
                        useMultiSamplers: bool
                      }

                      if (bool) {
                        updateObject.useAllSamplers = false
                      }

                      setInput(updateObject)
                    }}
                  />
                </div>
                <div style={{ padding: '8px 0' }}>
                  <Checkbox
                    label="Use all samplers?"
                    checked={input.useAllSamplers}
                    onChange={(bool: boolean) => {
                      const updateObject: Partial<DefaultPromptInput> = {
                        useAllSamplers: bool
                      }

                      if (bool) {
                        updateObject.useMultiSamplers = false
                      }

                      setInput(updateObject)
                    }}
                  />
                </div>
              </DropdownOptions>
            )}
          </>
        )}
        {!hideOptions && (
          <Button
            className={styles['settings-btn']}
            onClick={() => setShowDropdown(true)}
          >
            <IconSettings stroke={1.5} />
          </Button>
        )}
      </FlexRow>
    </OptionsRow>
  )
}
