import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { useStore } from 'statery'

import SelectComponent from '../../UI/Select'
import Input from '../../UI/Input'
import { appInfoStore } from '../../../store/appStore'
import Tooltip from '../../UI/Tooltip'
import { Button } from '../../UI/Button'
import TrashIcon from '../../icons/TrashIcon'
import { ModelDetails } from '../../../types'
import { SourceProcessing } from '../../../utils/promptUtils'
import { nearestWholeMultiple } from '../../../utils/imageUtils'
import { userInfoStore } from '../../../store/userStore'
import { maxSteps } from '../../../utils/validationUtils'
import useErrorMessage from '../../../hooks/useErrorMessage'

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

const samplerOptions = () => {
  const options = [
    { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
    { value: 'k_dpm_2', label: 'k_dpm_2' },
    { value: 'k_euler_a', label: 'k_euler_a' },
    { value: 'k_euler', label: 'k_euler' },
    { value: 'k_heun', label: 'k_heun' },
    { value: 'k_lms', label: 'k_lms' },
    { value: 'k_dpm_fast', label: 'k_dpm_fast' },
    { value: 'k_dpm_adaptive', label: 'k_dpm_adaptive' },
    { value: 'k_dpmpp_2m', label: 'k_dpmpp_2m' },
    { value: 'k_dpmpp_2s_a', label: 'k_dpmpp_2s_a' },
    { value: 'random', label: 'random' }
  ]

  // Temporarily hide options due to issues with Stable Horde backend.
  // Temporarily hide DDIM and PLMS based on convo with db0:
  // DDIM never worked in nataili. That reminds me, @Stable Horde: Integrator can you hide DDIM and PLMS until we get them working properly?
  // if (!img2img) {
  //   options.unshift({ value: 'PLMS', label: 'PLMS' })
  //   options.unshift({ value: 'DDIM', label: 'DDIM' })
  // }

  return options
}

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
  setHasValidationError: any
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  handleOrientationSelect,
  input,
  setInput,
  setHasValidationError
}: Props) => {
  const userState = useStore(userInfoStore)
  const appState = useStore(appInfoStore)
  const { loggedIn } = userState
  const { models } = appState

  const [errorMessage, setErrorMessage, hasError] = useErrorMessage()

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]
  // @ts-ignore
  const modelsValue = modelerOptions(models).filter((option) => {
    return input.models[0] === option.value
  })[0]
  const samplerValue = samplerOptions().filter((option) => {
    return input.sampler === option.value
  })[0]

  const validateSteps = useCallback(() => {
    if (
      isNaN(input.steps) ||
      input.steps < 1 ||
      input.steps > maxSteps(input.sampler, loggedIn)
    ) {
      setErrorMessage({
        steps: `Please enter a valid number between 1 and ${maxSteps(
          input.sampler,
          loggedIn
        )}`
      })
    } else {
      setErrorMessage({ steps: null })
    }
  }, [input.sampler, input.steps, loggedIn, setErrorMessage])

  useEffect(() => {
    setHasValidationError(hasError)
  }, [hasError, setHasValidationError])

  useEffect(() => {
    validateSteps()
  }, [input.sampler, validateSteps])

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
              setInput({ orientationType: obj.value, height: 512, width: 512 })

              if (obj.value !== 'custom') {
                setErrorMessage({ height: null, width: null })
              }
            }}
            value={orientationValue}
            isSearchable={false}
          />
          {orientationValue?.value === 'custom' && (
            <>
              <div className="block text-xs mt-4 w-full">
                Max size for each dimension: {loggedIn ? 3072 : 1024} pixels
                {loggedIn && input.height * input.width > 1024 * 1024 && (
                  <div className="text-red-500 font-bold">
                    WARNING: You will need to have enough kudos to complete this
                    request.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 justify-start">
                <div className="mt-2 flex flex-row gap-4 items-center">
                  <SubSectionTitle>Width</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    type="text"
                    name="width"
                    error={errorMessage.width}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value > (loggedIn ? 3072 : 1024)
                      ) {
                        setErrorMessage({
                          width: `Please enter a valid number between 64 and ${
                            loggedIn ? 3072 : 1024
                          }`
                        })
                        return
                      }

                      if (errorMessage.width) {
                        setErrorMessage({ width: null })
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
                {errorMessage.width && (
                  <div className="mb-2 text-red-500 font-bold">
                    {errorMessage.width}
                  </div>
                )}
                <div className="flex flex-row gap-4 items-center">
                  <SubSectionTitle>Height</SubSectionTitle>
                  <Input
                    // @ts-ignore
                    className="mb-2"
                    type="text"
                    name="height"
                    error={errorMessage.height}
                    onChange={handleChangeInput}
                    onBlur={(e: any) => {
                      if (input.orientationType !== 'custom') {
                        return
                      }

                      if (
                        isNaN(e.target.value) ||
                        e.target.value < 64 ||
                        e.target.value > (loggedIn ? 3072 : 1024)
                      ) {
                        setErrorMessage({
                          height: `Please enter a valid number between 64 and ${
                            loggedIn ? 3072 : 1024
                          }`
                        })
                        return
                      }

                      if (errorMessage.height) {
                        setErrorMessage({ height: null })
                      }

                      setInput({
                        height: nearestWholeMultiple(e.target.value)
                      })
                    }}
                    // @ts-ignore
                    value={input.height}
                    width="75px"
                  />
                </div>
                {errorMessage.height && (
                  <div className="mb-2 text-red-500 font-bold">
                    {errorMessage.height}
                  </div>
                )}
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
            options={samplerOptions()}
            onChange={(obj: { value: string; label: string }) => {
              setInput({ sampler: obj.value })
              localStorage.setItem('sampler', obj.value)
            }}
            isSearchable={false}
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
          <div className="block text-xs w-full">
            (1 - {maxSteps(input.sampler, loggedIn)})
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={errorMessage.steps}
            className="mb-2"
            type="text"
            name="steps"
            onChange={handleChangeInput}
            onBlur={() => {
              validateSteps()
            }}
            // @ts-ignore
            value={input.steps}
            width="100%"
          />
        </MaxWidth>
        {errorMessage.steps && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {errorMessage.steps}
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
          <div className="block text-xs w-full">(1 - 30)</div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            error={errorMessage.cfg_scale}
            className="mb-2"
            type="text"
            name="cfg_scale"
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 30
              ) {
                setErrorMessage({
                  cfg_scale: 'Please enter a valid number between 1 and 30'
                })
              } else if (errorMessage.cfg_scale) {
                setErrorMessage({ cfg_scale: null })
              }
            }}
            onChange={handleChangeInput}
            // @ts-ignore
            value={input.cfg_scale}
            width="100%"
          />
        </MaxWidth>
        {errorMessage.cfg_scale && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {errorMessage.cfg_scale}
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
              isSearchable={false}
            />
          </MaxWidth>
        </Section>
      )}
      <Section>
        <SubSectionTitle>
          Number of images
          <div className="block text-xs w-full">(1 - 20)</div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="120"
        >
          <Input
            // @ts-ignore
            className="mb-2"
            error={errorMessage.numImages}
            type="text"
            name="numImages"
            onChange={handleChangeInput}
            onBlur={(e: any) => {
              if (
                isNaN(e.target.value) ||
                e.target.value < 1 ||
                e.target.value > 20
              ) {
                setErrorMessage({
                  numImages: 'Please enter a valid number between 1 and 20'
                })
              } else if (errorMessage.numImages) {
                setErrorMessage({ numImages: null })
              }
            }}
            // @ts-ignore
            value={input.numImages}
            width="100%"
          />
        </MaxWidth>
        {errorMessage.numImages && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            {errorMessage.numImages}
          </div>
        )}
      </Section>
    </div>
  )
}

export default AdvancedOptionsPanel
