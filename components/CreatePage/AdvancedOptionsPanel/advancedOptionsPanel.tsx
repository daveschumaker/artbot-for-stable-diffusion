import React, { useState } from 'react'
import styled from 'styled-components'

import SelectComponent from '../../UI/Select'
import Input from '../../UI/Input'
import { useStore } from 'statery'
import { appInfoStore } from '../../../store/appStore'
import Tooltip from '../../UI/Tooltip'
import { Button } from '../../UI/Button'
import TrashIcon from '../../icons/TrashIcon'
import { ModelDetails } from '../../../types'
import { SourceProcessing } from '../../../utils/promptUtils'
import { nearestWholeMultiple } from '../../../utils/imageUtils'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

interface FlexRowProps {
  bottomPadding?: number
}

const FlexRow = styled.div<FlexRowProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;

  ${(props) =>
    props.bottomPadding &&
    `
    padding-bottom: ${props.bottomPadding}px;
  `}
`

interface MaxWidthProps {
  maxWidth?: number
}

const MaxWidth = styled.div<MaxWidthProps>`
  width: 100%;

  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth}px;
  `}
`

const orientationOptions = [
  { value: 'landscape-16x9', label: 'Landscape (16 x 9)' },
  { value: 'landscape', label: 'Landscape (3 x 2)' },
  { value: 'portrait', label: 'Portrait (2 x 3)' },
  { value: 'phone-bg', label: 'Phone background (9 x 21)' },
  { value: 'ultrawide', label: 'Ultrawide (21 x 9)' },
  { value: 'square', label: 'Square' },
  { value: 'custom', label: 'Custom' },
  { value: 'random', label: 'Random!' }
]

const modelerOptions = (models: Array<ModelDetails>) => {
  return models.map((model) => {
    return { value: model.name, label: `${model.name} (${model.count})` }
  })
}

const samplerOptions = (img2img: boolean) => {
  const options = [
    { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
    { value: 'k_dpm_2', label: 'k_dpm_2' },
    { value: 'k_euler_a', label: 'k_euler_a' },
    { value: 'k_euler', label: 'k_euler' },
    { value: 'k_heun', label: 'k_heun' },
    { value: 'k_lms', label: 'k_lms' },
    { value: 'random', label: 'random' }
  ]

  if (!img2img) {
    options.unshift({ value: 'PLMS', label: 'PLMS' })
    options.unshift({ value: 'DDIM', label: 'DDIM' })
  }

  return options
}

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  handleOrientationSelect,
  input,
  setInput
}: Props) => {
  const appState = useStore(appInfoStore)
  const { models } = appState

  const [hasError, setHasError] = useState({})

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]
  // @ts-ignore
  const modelsValue = modelerOptions(models).filter((option) => {
    return input.models[0] === option.value
  })[0]
  const samplerValue = samplerOptions(input.img2img).filter((option) => {
    return input.sampler === option.value
  })[0]

  return (
    <div>
      <Section>
        <SubSectionTitle>Image orientation</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="480"
        >
          <SelectComponent
            options={orientationOptions}
            onChange={(obj: { value: string; label: string }) => {
              handleOrientationSelect(obj.value)
              setInput({ orientationType: obj.value })
            }}
            value={orientationValue}
          />
          {orientationValue?.value === 'custom' && (
            <>
              <div className="mt-2 flex flex-col gap-4 justify-start">
                <div className="mt-2 flex flex-row gap-4 items-center">
                  <SubSectionTitle>Width</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    type="text"
                    name="width"
                    error={hasError.width}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value > 1024
                      ) {
                        setHasError({
                          width:
                            'Please enter a valid number between 64 and 1024'
                        })
                        return
                      }

                      if (hasError.width) {
                        setHasError({})
                      }

                      setInput({
                        width: nearestWholeMultiple(e.target.value)
                      })
                    }}
                    // @ts-ignore
                    value={input.width}
                    width="75px"
                  />
                </div>
                {hasError.width && (
                  <div className="mb-2 text-red-500 font-bold">
                    {hasError.width}
                  </div>
                )}
                <div className="flex flex-row gap-4 items-center">
                  <SubSectionTitle>Height</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    name="height"
                    onChange={handleChangeInput}
                    // @ts-ignore
                    value={input.height}
                    width="75px"
                  />
                </div>
              </div>
              <div className="block text-xs mt-2 w-full">
                Height and widths must be divisible by 64. Enter your desired
                dimensions and it will be automatically convereted to nearest
                valid integer.
              </div>
            </>
          )}
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          Negative prompt
          <Tooltip width="180px">
            Add words or phrases to demphasize from your desired image
          </Tooltip>
        </SubSectionTitle>
        <FlexRow>
          <Input
            // @ts-ignore
            className="mb-2"
            type="text"
            name="negative"
            onChange={handleChangeInput}
            // @ts-ignore
            value={input.negative}
            width="100%"
          />
          <Button
            title="Clear current input"
            btnType="secondary"
            onClick={() => {
              return setInput({
                negative: ''
              })
            }}
          >
            <TrashIcon />
          </Button>
        </FlexRow>
      </Section>
      <Section>
        <SubSectionTitle>Sampler</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <SelectComponent
            options={samplerOptions(input.img2img)}
            onChange={(obj: { value: string; label: string }) => {
              setInput({ sampler: obj.value })
              localStorage.setItem('sampler', obj.value)
            }}
            value={samplerValue}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          Steps
          <Tooltip width="200px">
            Fewer steps generally result in quicker image generations. Many
            models achieve full coherence after a certain number of finite steps
            (60 - 90). Keep your initial queries in the 30 - 50 range for best
            results.
          </Tooltip>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={hasError.steps}
            className="mb-2"
            type="text"
            name="steps"
            onChange={handleChangeInput}
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 200
              ) {
                setHasError({
                  steps: 'Please enter a valid number between 1 and 200'
                })
              } else if (hasError.steps) {
                setHasError({})
              }
            }}
            // @ts-ignore
            value={input.steps}
            width="100%"
          />
        </MaxWidth>
        {hasError.steps && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {hasError.steps}
          </div>
        )}
      </Section>
      <Section>
        <SubSectionTitle>
          Guidance
          <Tooltip width="200px">
            Higher numbers follow the prompt more closely. Lower numbers give
            more creativity.
          </Tooltip>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={hasError.cfg_scale}
            className="mb-2"
            type="text"
            name="cfg_scale"
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 30
              ) {
                setHasError({
                  cfg_scale: 'Please enter a valid number between 1 and 30'
                })
              } else if (hasError.cfg_scale) {
                setHasError({})
              }
            }}
            onChange={handleChangeInput}
            // @ts-ignore
            value={input.cfg_scale}
            width="100%"
          />
        </MaxWidth>
        {hasError.cfg_scale && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {hasError.cfg_scale}
          </div>
        )}
      </Section>
      {input.img2img ||
        (input.source_processing !== SourceProcessing.Prompt && (
          <Section>
            <SubSectionTitle>Denoise</SubSectionTitle>
            <MaxWidth
              // @ts-ignore
              maxWidth="120"
            >
              <Input
                // @ts-ignore
                className="mb-2"
                type="text"
                name="denoising_strength"
                onChange={handleChangeInput}
                // @ts-ignore
                value={input.denoising_strength}
                width="100%"
              />
            </MaxWidth>
          </Section>
        ))}
      <Section>
        <SubSectionTitle>
          Seed
          <Tooltip width="140px">Leave seed blank for random.</Tooltip>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Input
            // @ts-ignore
            className="mb-2"
            type="text"
            name="seed"
            onChange={handleChangeInput}
            // @ts-ignore
            value={input.seed}
            width="100%"
          />
        </MaxWidth>
      </Section>
      {input.source_processing !==
        (SourceProcessing.InPainting || SourceProcessing.OutPaiting) && (
        <Section>
          <SubSectionTitle>
            Model
            <Tooltip width="240px">
              Models currently available within the horde. Numbers in
              paranthesis indicate number of works. Generally, these models will
              generate images quicker.
            </Tooltip>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <SelectComponent
              menuPlacement={'top'}
              //@ts-ignore
              options={modelerOptions(models)}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ models: [obj.value] })
              }}
              value={modelsValue}
            />
          </MaxWidth>
        </Section>
      )}
      <Section>
        <SubSectionTitle>Number of images</SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            className="mb-2"
            error={hasError.numImages}
            type="text"
            name="numImages"
            onChange={handleChangeInput}
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 20
              ) {
                setHasError({
                  numImages: 'Please enter a valid number between 1 and 20'
                })
              } else if (hasError.numImages) {
                setHasError({})
              }
            }}
            // @ts-ignore
            value={input.numImages}
            width="100%"
          />
        </MaxWidth>
        {hasError.numImages && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {hasError.numImages}
          </div>
        )}
      </Section>
    </div>
  )
}

export default AdvancedOptionsPanel
