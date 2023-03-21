import React, { useState, useEffect } from 'react'

// Import UI components
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TextTooltipRow from 'components/UI/TextTooltipRow'
import Tooltip from 'components/UI/Tooltip'
import NumberInput from 'components/UI/NumberInput'
import Slider from 'components/UI/Slider'

import clsx from 'clsx'
import Input from 'components/UI/Input'
import ReactSwitch from 'react-switch'

interface Props {
  label: string
  tooltip?: string
  from: number
  to: number
  step: number
  input: { [key: string]: any }
  setInput: any
  fieldName: string
  initialLoad: boolean
  disabled?: boolean
  fullWidth?: boolean
  enforceStepValue?: boolean
  callback?: (value: number) => void
  werewolfFieldName?: string
  werewolfFieldName2?: string
  werewolfEnabledCallback?: () => void
  werewolfDisabledCallback?: () => void,
  werewolfDisableCheckbox?: boolean
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
  initialLoad,
  disabled = false,
  fullWidth = false,
  enforceStepValue = false,
  callback = () => { },
  werewolfFieldName = '',
  werewolfFieldName2 = '',
  werewolfEnabledCallback = () => {},
  werewolfDisabledCallback = () => {},
  werewolfDisableCheckbox = false
}: Props) => {
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (input[werewolfFieldName2]){
      werewolfEnabledCallback()
    }
    else {
      werewolfDisabledCallback()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input[werewolfFieldName2]])

  function toggleWarning(state: boolean) {
    setWarning(state ? `This field only accepts numbers between ${from} and ${to}.` : '')
  }

  function keepInBoundaries(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max))
  }

  function roundToNearestStep(val: number, min: number, max: number, step: number) {
    val = keepInBoundaries(val, min, max)
    const steps = Math.round((val - min) / step);
    const newValue = min + steps * step;
    return newValue;
  }

  function updateField(value: number) {
    const res = {}
    // @ts-ignore
    res[fieldName] = value
    setInput(res)
    callback(value)
    // @ts-ignore
    setTemporaryValue(res[fieldName])
  }

  function safelyUpdateField(value: string | number) {
    value = Number(value)
    if (isNaN(value) || value < from || value > to) {
      if (initialLoad) {
        return
      }

      toggleWarning(true)
      updateField(isNaN(value) ? to : keepInBoundaries(value, from, to))
    } else {
      toggleWarning(false)

      if (enforceStepValue) {
        value = roundToNearestStep(value, from, to, step)
      }

      updateField(value)
    }
  }


  const [temporaryValue, setTemporaryValue] = useState(input[fieldName]);

  useEffect(() => {
    // We don't want to force input in incorrect boundaries
    if (initialLoad) {
      return
    }

    const newValue = input[fieldName]
    let correctedNewValue
    if (enforceStepValue) {
      correctedNewValue = roundToNearestStep(newValue, from, to, step)
    }
    else {
      correctedNewValue = keepInBoundaries(newValue, from, to)
    }

    if (newValue !== correctedNewValue) {
      const res = {}
      // @ts-ignore
      res[fieldName] = correctedNewValue
      setInput(res)

      console.log('Invalid value loaded in', fieldName, '. Force updating to', correctedNewValue, 'from', newValue)
      return
    }

    setTemporaryValue(input[fieldName])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input[fieldName], fieldName, from, to, step])

  const handleNumberInput = (event: any) => {
    setTemporaryValue(event.target.value)
  }

  const singleMode = {
    main: (
      <>
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
      </>
    ),
    slider: (
      <>
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
      </>
    )
  }

  const multipleMode = {
    main: (
      <>
        {
          // TODO: Add clear button here
        }
      </>
    ),
    slider: (
      <>
        <Input
          // @ts-ignore
          className="mb-2"
          type="text"
          name={werewolfFieldName}
          onChange={(e: any) => {
            setInput({ [werewolfFieldName]: e.target.value })
          }}
          placeholder={`${from},${to}`}
          // onBlur={() => {
          //   validateSteps()
          // }}
          // @ts-ignore
          value={input[werewolfFieldName]}
          width="100%"
        />
      </>
    )
  }

  return (
    <div className={clsx('mb-4 w-full', !fullWidth && 'md:w-1/2')}>
      <Section>
        <div className="flex flex-row items-center justify-between">
          <SubSectionTitle>
            <TextTooltipRow>
              {label}
              {tooltip && <Tooltip tooltipId={fieldName}>{tooltip}</Tooltip>}
              {werewolfFieldName && (
                // TODO: Replace me with some cute icon button! UwU
                <>
                  <ReactSwitch
                    disabled={werewolfDisableCheckbox}
                    onChange={() => {
                      console.log({[werewolfFieldName2]: !input[werewolfFieldName2]})
                      setInput({[werewolfFieldName2]: !input[werewolfFieldName2]})
                    }}
                    checked={input[werewolfFieldName2]}
                  />
                </>
              )}
            </TextTooltipRow>

            <div className="block text-xs w-full">
              ({from} - {to})
            </div>
          </SubSectionTitle>
          {input[werewolfFieldName2] ? multipleMode.main : singleMode.main}
        </div>
        {input[werewolfFieldName2] ? multipleMode.slider : singleMode.slider}
        {warning && (
          <div className="mb-2 text-xs">{warning}</div>
        )}
      </Section>
    </div>
  )
}

export default NumericInputSlider
