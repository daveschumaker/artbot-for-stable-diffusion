import React, { useState } from "react";

// Import UI components
import Section from '../../../UI/Section'
import SubSectionTitle from "../../../UI/SubSectionTitle";
import TextTooltipRow from "../../../UI/TextTooltipRow";
import Tooltip from "../../../UI/Tooltip";
import NumberInput from "../../../UI/NumberInput";
import Slider from "../../../UI/Slider";

interface Props {
    input: { [key: string]: any };
    setInput: any;
    fieldName: string;
}
  

const InputSlider = ( {input, setInput, fieldName }: Props) => {

  const errorMessageDefault: {[key: string]: any} = { facefixer_strength: null };
  const [errorMessage, setErrorMessage] = useState(errorMessageDefault);

  const [initialLoad] = useState(true);

  const handleNumberInput = (value: string | number) => {
    const res = {};
    // @ts-ignore
    res[fieldName] = Number(value);
    setInput(res);
  };

  const handleChangeInput = (value: string | number) => {
    const res = {};
    // @ts-ignore
    res[fieldName] = Number(value);
    setInput(res);
  };

  return (
    <div className="mb-8 w-full md:w-1/2">
      <Section>
        <div className="flex flex-row items-center justify-between">
          <SubSectionTitle>
            <TextTooltipRow>
              Face-fix strength
              <Tooltip left="-20" width="240px">
                0.05 is the weakest effect (barely noticeable improvements),
                while 1.0 is the strongest effect.
              </Tooltip>
            </TextTooltipRow>
            <div className="block text-xs w-full">(0.05 - 1.0)</div>
          </SubSectionTitle>
          <NumberInput
            className="mb-2"
            error={errorMessage.facefixer_strength}
            type="text"
            min={0.05}
            max={1}
            step={0.05}
            name="facefixer_strength"
            onMinusClick={() => {
              const value = Number((input[fieldName] - 0.05).toFixed(2));
              input[fieldName] = value;
            }}
            onPlusClick={() => {
              const value = Number((input[fieldName] + 0.05).toFixed(2));
              input[fieldName] = value;
            }}
            onChange={handleNumberInput}
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 0.05 ||
                e.target.value > 1
              ) {
                if (initialLoad) {
                  return;
                }

                input[fieldName] = 1;
                setErrorMessage({
                  numImages: `Please enter a valid number between 0.05 and 1.00`,
                });
              } else if (errorMessage.facefixer_strength) {
                setErrorMessage({ facefixer_strength: null });
              }
            }}
            value={input[fieldName]}
            width="100%"
          />
        </div>
        <Slider
          value={input[fieldName]}
          min={0.05}
          max={1}
          step={0.05}
          onChange={(e: any) => {
            handleChangeInput(e.target.value);
          }}
        />
      </Section>
    </div>
  );
};

export default InputSlider;
