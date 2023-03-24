import React, { useState, useEffect, useCallback } from 'react'

// Import UI components
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TextTooltipRow from 'components/UI/TextTooltipRow'
import Tooltip from 'components/UI/Tooltip'
import NumberInput from 'components/UI/NumberInput'
import Slider from 'components/UI/Slider'

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
  callback?: (value: number)=>void
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
  fullWidth = false,
  enforceStepValue = false,
  callback = () => {}
}: Props) => {
  const inputField = input[fieldName]
  const [temporaryValue, setTemporaryValue] = useState(inputField)

  const [warning, setWarning] = useState('')

  const toggleWarning = useCallback((state: boolean) => {
    setWarning(state ? `This field only accepts numbers between ${from} and ${to}.` : '')
  }, [from, to])

  const keepInBoundaries = useCallback((val: number)=>{
    return Math.max(from, Math.min(val, to))
  }, [from, to])

  const roundToNearestStep = useCallback((val: number) =>{
    val = keepInBoundaries(val)
    const steps = Math.round((val - from) / step);
    const newValue = from + steps * step;
    return newValue;
  }, [from, keepInBoundaries, step])

  function updateField (value: number) {
    setInput({[fieldName]: value})
    setTemporaryValue(value)
    callback(value)
  }

  function safelyUpdateField (value: string | number) {
    value = Number(value)
    if (isNaN(value) || value < from || value > to) {
      toggleWarning(true)
      updateField(isNaN(value)?to:keepInBoundaries(value))
    } else {
      toggleWarning(false)

      if (enforceStepValue){
        value = roundToNearestStep(value)
      }

      updateField(value)
    }
  }

  useEffect(() => {
    let correctedInputField = enforceStepValue ? roundToNearestStep(inputField) : keepInBoundaries(inputField)

    toggleWarning(inputField !== correctedInputField)
  }, [inputField, enforceStepValue, roundToNearestStep, toggleWarning, keepInBoundaries])

  useEffect(() => {
    setTemporaryValue(inputField)
  }, [inputField])

  const handleNumberInput = (event: any) => {
    setTemporaryValue(event.target.value)
  }

  return (
    <div className={clsx('mb-4 w-full', !fullWidth && 'md:w-1/2')}>
      <Section>
        <div className="flex flex-row items-center justify-between">
          <SubSectionTitle>
            <TextTooltipRow>
              {label}
              {tooltip && <Tooltip tooltipId={fieldName}>{tooltip}</Tooltip>}
            </TextTooltipRow>

            <div className="block text-xs w-full">
              ({from} - {to})
            </div>
          </SubSectionTitle>
          <NumberInput
            className="mb-2"
            type="text"
            min={from}
            max={to}
            step={step}
            name={fieldName}
            disabled={disabled}
            onMinusClick={() => {
              const value = Number((input[fieldName] - step).toFixed(2))
              safelyUpdateField(value)
            }}
            onPlusClick={() => {
              const value = Number((input[fieldName] + step).toFixed(2))
              safelyUpdateField(value)
            }}
            onChange={handleNumberInput}
            onBlur={(e: any) => {
              const value = Number(e.target.value)
              safelyUpdateField(value)
            }}
            value={temporaryValue}
            width="100%"
          />
        </div>
        <Slider
          value={input[fieldName]}
          min={from}
          max={to}
          step={step}
          disabled={disabled}
          onChange={(e: any) => {
            safelyUpdateField(e.target.value)
          }}
        />
        {warning && (
          <div className="mb-2 text-xs">{warning}</div>
        )}
      </Section>
    </div>
  )
}

export default NumericInputSlider
