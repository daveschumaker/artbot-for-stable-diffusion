import React, { useState } from "react";

// Import UI components
import Section from '../../../UI/Section'
import SubSectionTitle from "../../../UI/SubSectionTitle";
import TextTooltipRow from "../../../UI/TextTooltipRow";
import Tooltip from "../../../UI/Tooltip";
import NumberInput from "../../../UI/NumberInput";
import Slider from "../../../UI/Slider";

interface Props {
    label: string;
    tooltip: string;
    from: number;
    to: number;
    step: number;
    input: { [key: string]: any };
    setInput: any;
    fieldName: string;
    initialLoad: boolean;
    disabled?: boolean;
}
  

const InputSlider = ( {
  label, 
  tooltip,
  from,
  to,
  step,
  input, 
  setInput, 
  fieldName,
  initialLoad,
  disabled = false
}: Props) => {

  const errorMessageDefault: {[key: string]: any} = { facefixer_strength: null };
  const [errorMessage, setErrorMessage] = useState(errorMessageDefault);

  const updateField = (value: string | number) => {
    const res = {};
    // @ts-ignore
    res[fieldName] = Number(value);
    setInput(res);
  }

  const updateError = (value: string | number) => {
    value = Number(value);
    if (isNaN(value) || value < from || value > to) {
      if (initialLoad) {
        return;
      }

      updateField(to);
      const errorUpdate = {};
      // @ts-ignore
      errorUpdate[fieldName] = `This field only accepts numbers between ${from} and ${to}.`;
      setErrorMessage(errorUpdate);
    } else if (errorMessage[fieldName]) {
      const errorUpdate = {};
      // @ts-ignore
      errorUpdate[fieldName] = null;
      setErrorMessage(errorUpdate);
    }
  }

  const handleNumberInput = (event: any) => {
    const value = Number(event.target.value);
    if (isNaN(value)) return;
    updateField(value);
  };

  const handleChangeInput = (value: string | number) => {
    updateField(value);
    updateError(value);
  };

  return (
    <div className="mb-8 w-full md:w-1/2">
      <Section>
        <div className="flex flex-row items-center justify-between">
          <SubSectionTitle>
            <TextTooltipRow>
              {label}
              <Tooltip left="-20" width="240px">
                {tooltip}
              </Tooltip>
            </TextTooltipRow>
            <div className="block text-xs w-full">({from} - {to})</div>
          </SubSectionTitle>
          <NumberInput
            className="mb-2"
            type="text"
            min={0.05}
            max={1}
            step={0.05}
            name={fieldName}
            disabled={disabled}
            onMinusClick={() => {
              const value = Number((input[fieldName] - step).toFixed(2));
              updateField(value);
              updateError(value);
            }}
            onPlusClick={() => {
              const value = Number((input[fieldName] + step).toFixed(2));
              updateField(value);
              updateError(value);
            }}
            onChange={handleNumberInput}
            onBlur={(e: any) => {
              const value = Number(e.target.value);
              updateError(value);
            }}
            value={input[fieldName]}
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
            handleChangeInput(e.target.value);
          }}
        />
        {errorMessage[fieldName] && (
                <div className="mb-2 text-red-500 text-md font-bold">
                  {errorMessage[fieldName]}
                </div>
              )}
      </Section>
    </div>
  );
};

export default InputSlider;
