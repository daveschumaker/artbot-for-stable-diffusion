import React, { useState, useEffect } from 'react'

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
  const [warning, setWarning] = useState('')

  function toggleWarning (state: boolean) {
    setWarning(state ? `This field only accepts numbers between ${from} and ${to}.` : '')
  }

  function keepInBoundaries (val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max))
  }

  function roundToNearestStep(val: number, min: number, max: number, step: number) {
    val = keepInBoundaries(val, min, max)
    const steps = Math.round((val - min) / step);
    const newValue = min + steps * step;
    return newValue;
  }

  function updateField (value: number) {
    const res = {}
    // @ts-ignore
    res[fieldName] = value
    setInput(res)
    callback(value)
    // @ts-ignore
    setTemporaryValue(res[fieldName])
  }

  function safelyUpdateField (value: string | number) {
    value = Number(value)
    if (isNaN(value) || value < from || value > to) {
      toggleWarning(true)
      updateField(isNaN(value)?to:keepInBoundaries(value, from, to))
    } else {
      toggleWarning(false)

      if (enforceStepValue){
        value = roundToNearestStep(value, from, to, step)
      }

      updateField(value)
    }
  }


  const [temporaryValue, setTemporaryValue] = useState(input[fieldName]);

  useEffect(() => {
    const newValue = input[fieldName]
    let correctedNewValue = enforceStepValue ? roundToNearestStep(newValue, from, to, step) : keepInBoundaries(newValue, from, to)

    toggleWarning(newValue !== correctedNewValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldName, from, to, step])

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
