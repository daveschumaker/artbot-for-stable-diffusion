import { GetSetPromptInput } from 'types'
import NumericInputSlider from '../NumericInputSlider'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'components/UI/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'components/UI/Checkbox'
import Input from 'components/UI/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import { maxSteps } from 'utils/validationUtils'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'

interface StepsOptions extends GetSetPromptInput {
  hideOptions?: boolean
}

export default function Steps({
  hideOptions = false,
  input,
  setInput
}: StepsOptions) {
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <FlexRow style={{ columnGap: '4px', position: 'relative' }}>
      {input.useMultiSteps && (
        <div className="mb-4 w-full">
          <SubSectionTitle>
            <TextTooltipRow>
              Steps
              <span
                className="text-xs w-full font-[400]"
                style={{ paddingRight: '4px', width: 'auto' }}
              >
                &nbsp;(1 -{' '}
                {maxSteps({
                  sampler: input.sampler,
                  loggedIn: loggedIn === true ? true : false
                })}
                )
              </span>
              <TooltipComponent tooltipId="multi-steps-tooltip">
                Comma separated values to create a series of images using
                multiple steps. Example: 16, 20, 25, 40
              </TooltipComponent>
            </TextTooltipRow>
          </SubSectionTitle>
          <Input
            // @ts-ignore
            type="text"
            name="multiSteps"
            onChange={(e: any) => {
              setInput({ multiSteps: e.target.value })
            }}
            placeholder="16, 20, 25, 40"
            // @ts-ignore
            value={input.multiSteps}
            width="100%"
          />
        </div>
      )}
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
          fullWidth
          enforceStepValue
        />
      )}
      <div>
        <div
          className="label_padding"
          style={{ height: '16px', width: '1px' }}
        />
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="Step options"
            top="80px"
          >
            <div style={{ padding: '8px 0' }}>
              <Checkbox
                label="Use multi steps?"
                checked={input.useMultiSteps}
                onChange={(bool: boolean) => {
                  setInput({ useMultiSteps: bool })
                }}
              />
            </div>
          </DropdownOptions>
        )}
        {!hideOptions && (
          <Button onClick={() => setShowDropdown(true)}>
            <IconSettings stroke={1.5} />
          </Button>
        )}
      </div>
    </FlexRow>
  )
}
