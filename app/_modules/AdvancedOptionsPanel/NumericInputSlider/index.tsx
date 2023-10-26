import React, { useState, useEffect, useCallback } from 'react'

// Import UI components
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import TextTooltipRow from 'app/_components/TextTooltipRow'
import TooltipComponent from 'app/_components/TooltipComponent'
import NumberInput from 'app/_components/NumberInput'

import clsx from 'clsx'

interface Props {
  label: string
  tooltip?: string
  from: number
  to: number
  step: number
  input: { [key: string]: any }
  setInput: any
  fieldName: string
  disabled?: boolean
  fullWidth?: boolean
  enforceStepValue?: boolean
  callback?: (value: number) => void
}

const NumericInputSlider = ({
  label,
  tooltip,
  from,
  to,
  step,
  input,
  setInput,
  fieldName,
  disabled = false,
  enforceStepValue = false,
  callback = () => {}
}: Props) => {
  const inputField = input[fieldName]
  const [temporaryValue, setTemporaryValue] = useState(inputField)

  const [showWarning, setShowWarning] = useState(false)

  const keepInBoundaries = useCallback(
    (val: number) => {
      return Math.max(from, Math.min(val, to))
    },
    [from, to]
  )

  const roundToNearestStep = useCallback(
    (val: number) => {
      val = keepInBoundaries(val)
      const steps = Math.round((val - from) / step)
      const newValue = from + steps * step
      return newValue
    },
    [from, keepInBoundaries, step]
  )

  function updateField(value: number) {
    setInput({ [fieldName]: value })
    setTemporaryValue(value)
    callback(value)
  }

  function safelyUpdateField(value: string | number) {
    value = Number(value)
    if (isNaN(value) || value < from || value > to) {
      setShowWarning(true)
      updateField(isNaN(value) ? to : keepInBoundaries(value))
    } else {
      setShowWarning(false)

      if (enforceStepValue) {
        value = roundToNearestStep(value)
      }

      updateField(value)
    }
  }

  // Show warnings to users who logged out after setting high values on sliders.
  useEffect(() => {
    let correctedInputField = enforceStepValue
      ? roundToNearestStep(inputField)
      : keepInBoundaries(inputField)

    setShowWarning(inputField !== correctedInputField)

    // inputField is not included in dependency array on purpose.
    // Including it leads to a race condition which sometimes makes warnings disappear without user input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enforceStepValue, roundToNearestStep, keepInBoundaries])

  // Make sure text value on input is always up-to-date.
  useEffect(() => {
    setTemporaryValue(inputField)
  }, [inputField])

  return (
    <div className={clsx('mb-4 w-full')}>
      <Section style={{ paddingTop: 0 }}>
        <SubSectionTitle>
          <TextTooltipRow>
            {label}
            <span
              className="text-xs w-full font-[400]"
              style={{ paddingRight: '4px', width: 'auto' }}
            >
              &nbsp;({from} - {to})
            </span>
            {tooltip && (
              <TooltipComponent tooltipId={fieldName}>
                {tooltip}
              </TooltipComponent>
            )}
          </TextTooltipRow>
        </SubSectionTitle>
        <NumberInput
          inputMode="numeric"
          min={from}
          max={to}
          disabled={disabled}
          onMinusClick={() => {
            const value = Number((inputField - step).toFixed(2))
            safelyUpdateField(value)
          }}
          onPlusClick={() => {
            const value = Number((inputField + step).toFixed(2))
            safelyUpdateField(value)
          }}
          onInputChange={(e: any) => {
            // Note that we use setTemporaryValue, not safelyUpdateField.
            // This is because we want to let users enter arbitrary data in the input.
            // Validation and field update is performed after user finishes typing (see onBlur).
            const value = e.target.value
            setTemporaryValue(value)
          }}
          onBlur={(e: any) => {
            const value = Number(e.target.value)
            safelyUpdateField(value)
          }}
          value={temporaryValue}
          width="100%"
        />
      </Section>
      {showWarning && (
        <div className="mb-2 text-xs">
          This field only accepts numbers between {from} and {to}.
        </div>
      )}
    </div>
  )
}

export default NumericInputSlider
