import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import Input from 'app/_components/Input'
import TooltipComponent from 'app/_components/TooltipComponent'
import { maxSteps } from 'app/_utils/validationUtils'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import NumberInput from 'app/_components/NumberInput'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './steps.module.css'
import Slider from 'app/_components/Slider'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'
interface StepsOptions {
  hideOptions?: boolean
}

export default function Steps({ hideOptions = false }: StepsOptions) {
  const { input, setInput } = useInput()

  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const [showDropdown, setShowDropdown] = useState(false)
  const [step] = useState(1)

  const MAX_STEPS = maxSteps({
    sampler: input.sampler,
    loggedIn: loggedIn === true ? true : false,
    isSlider: true
  })

  return (
    <OptionsRow>
      <OptionsRowLabel>
        Steps
        <TooltipComponent tooltipId="steps-tooltip">
          Fewer steps generally result in quicker image generations. Many models
          achieve full coherence after a certain number of finite steps (60 -
          90). Keep your initial queries in the 30 - 50 range for best results.
        </TooltipComponent>
      </OptionsRowLabel>
      <FlexRow
        justifyContent="space-between"
        gap={8}
        style={{ position: 'relative' }}
      >
        {input.useMultiSteps && (
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
        )}
        {!input.useMultiSteps && (
          <>
            <div className={styles['slider-wrapper']}>
              <Slider
                value={input.steps}
                min={1}
                max={MAX_STEPS}
                step={1}
                onChange={(e: any) => {
                  setInput({ steps: e.target.value })
                }}
              />
            </div>
            <NumberInput
              className={styles['input-width']}
              min={1}
              max={MAX_STEPS}
              // disabled={disabled}
              onBlur={() => {
                setInput({ steps: Number(input.steps) })
              }}
              onInputChange={(e) => {
                setInput({ steps: Number(e.target.value) })
              }}
              onMinusClick={() => {
                if (Number(input.steps) - step < 1) {
                  return
                }

                setInput({ steps: Number(input.steps) - step })
              }}
              onPlusClick={() => {
                if (Number(input.steps) + step > MAX_STEPS) {
                  return
                }

                setInput({ steps: Number(input.steps) + step })
              }}
              // onChangeStep={width && width < 800 ? handleChangeStep : undefined}
              step={step}
              value={input.steps}
              width="100%"
            />
          </>
        )}
        {!hideOptions && (
          <Button
            className={styles['steps-btn']}
            onClick={() => setShowDropdown(true)}
          >
            <IconSettings stroke={1.5} />
          </Button>
        )}
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="Step options"
            top="40px"
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
      </FlexRow>
    </OptionsRow>
  )
}
