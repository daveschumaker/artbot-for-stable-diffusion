import { useCallback, useEffect, useState } from 'react'
import {
  IconLock,
  IconLockOpen,
  IconRuler,
  IconSettings,
  IconSwitch2
} from '@tabler/icons-react'

import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import Select from 'app/_components/Select'
import { Button } from 'app/_components/Button'
import useWorkerDetails from 'app/_hooks/useWorkerDetails'
import FlexRow from 'app/_components/FlexRow'
import FlexCol from 'app/_components/FlexCol'
import { ImageOrientation } from 'app/_data-models/ImageOrientation'
import TooltipComponent from 'app/_components/TooltipComponent'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import DropdownOptions from 'app/_modules/DropdownOptions'
import CustomDimensions from './CustomDimensions'
import { useImageConstraints } from './hooks/useImageDimensions'
import { useBaselineDetails } from './hooks/useBaselineDetails'
import { useAspectRatio } from './hooks/useAspectRatio'
import { MIN_IMAGE_WIDTH } from '_constants'
import AspectRatioToggler from './AspectRatioToggler'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './imageOrientation.module.css'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

const MAX_WIDTH = 1024
const STEP_LENGTH = 64

const ImageOrientationOptions = () => {
  const { input, setInput } = useInput()

  const { imageMinSize, imageMaxSize } = useImageConstraints()
  const { baseline, baselineLoaded, setBaselineLoaded } = useBaselineDetails(
    input.models
  )
  const {
    keepAspectRatio,
    toggleKeepAspectRatio,
    getAspectRatioDeviation,
    getAspectRatioDeviationColor
  } = useAspectRatio(input.width, input.height)

  const [workerDetails] = useWorkerDetails()
  const [targetAspectRatio, setTargetAspectRatio] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [showCustomDimensions, setShowCustomDimensions] = useState(false)

  const getCurrentAspectRatio = useCallback(
    () => input.width / input.height,
    [input.height, input.width]
  )

  useEffect(() => {
    function scaleProportionally(height: number, width: number) {
      // Ensure inputs are numbers
      if (
        typeof height !== 'number' ||
        typeof width !== 'number' ||
        height <= 0 ||
        width <= 0
      ) {
        throw new Error(
          'Invalid input: height and width must be positive numbers.'
        )
      }

      // Calculate the aspect ratio
      let aspectRatio = width / height

      let newHeight, newWidth

      if (aspectRatio >= 1) {
        // width is greater or equal to height
        newWidth = MAX_WIDTH
        newHeight = newWidth / aspectRatio
      } else {
        // height is greater than width
        newHeight = MAX_WIDTH
        newWidth = newHeight * aspectRatio
      }

      // Find the closest lower number that is divisible by 64
      newWidth = Math.floor(newWidth / MIN_IMAGE_WIDTH) * MIN_IMAGE_WIDTH
      newHeight = Math.floor(newHeight / MIN_IMAGE_WIDTH) * MIN_IMAGE_WIDTH

      return { newWidth, newHeight }
    }

    if (!baselineLoaded && baseline) {
      if (baseline === 'stable_diffusion_xl') {
        const updatedSizes = scaleProportionally(input.height, input.width)
        setInput({
          models: [...input.models], // Leaving this out causes the model to get overwritten.
          height: updatedSizes.newHeight,
          width: updatedSizes.newWidth
        })
        setBaselineLoaded(true)
      }
    }
  }, [
    baseline,
    baselineLoaded,
    input.height,
    input.models,
    input.width,
    setBaselineLoaded,
    setInput
  ])

  const handleOrientationSelect = (orientation: string) => {
    const details = ImageOrientation.getOrientationDetails({
      baseline,
      orientation,
      height: input.height,
      width: input.width
    })

    // Automatically keep aspect ratio
    if (orientation !== 'custom') {
      setTargetAspectRatio(details.width / details.height)
    }

    setInput({
      orientationType: orientation,
      height: details.height,
      width: details.width
    })
  }

  const getMegapixelSize = () => {
    const size = input.height * input.width
    return (size / 1e6).toFixed(2)
  }

  const widthCallback = useCallback(
    (value: number) => {
      if (keepAspectRatio) {
        let nearestHeight = Math.round(value / targetAspectRatio)
        nearestHeight = Math.round(nearestHeight / 64) * 64

        setInput({
          height: Math.max(Math.min(nearestHeight, imageMaxSize), imageMinSize),
          width: value
        })
      } else if (input.orientationType !== 'custom') {
        setInput({ orientationType: 'custom' })
      }
    },
    [
      imageMaxSize,
      imageMinSize,
      input.orientationType,
      keepAspectRatio,
      setInput,
      targetAspectRatio
    ]
  )

  const heightCallback = useCallback(
    (value: number) => {
      if (keepAspectRatio) {
        let nearestWidth = Math.round(value * targetAspectRatio)
        nearestWidth = Math.round(nearestWidth / 64) * 64

        setInput({
          height: value,
          width: Math.max(Math.min(nearestWidth, imageMaxSize), imageMinSize)
        })
      } else if (input.orientationType !== 'custom') {
        setInput({ orientationType: 'custom' })
      }
    },
    [
      imageMaxSize,
      imageMinSize,
      input.orientationType,
      keepAspectRatio,
      setInput,
      targetAspectRatio
    ]
  )

  const orientationValue = ImageOrientation.dropdownOptions({
    baseline
  }).filter((option: any) => {
    return input.orientationType === option.value
  })[0]

  const totalPixels = input.height * input.width

  // Lock aspect ratio on initial run if orientation type is not custom
  useEffect(() => {
    if (keepAspectRatio) {
      setTargetAspectRatio(getCurrentAspectRatio())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepAspectRatio])

  // When this component first mounts, keep aspect ratio locked
  // if source image is present.
  useEffect(() => {
    if (input.source_image) {
      toggleKeepAspectRatio(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <OptionsRow>
      <OptionsRowLabel>Image orientation</OptionsRowLabel>
      {
        // @ts-ignore
        workerDetails && totalPixels > workerDetails.max_pixels && (
          <FlexRow className="gap-2 mb-2 text-red-600 text-[14px] font-[700]">
            Warning: These dimensions exceed the max_pixels for your targeted
            worker. Reduce resolution or remove targeted worker.
          </FlexRow>
        )
      }
      <FlexRow
        gap={4}
        style={{
          position: 'relative',
          flexWrap: 'wrap',
          rowGap: '4px',
          justifyContent: 'flex-end'
        }}
      >
        <Select
          options={ImageOrientation.dropdownOptions({ baseline })}
          onChange={(obj: { value: string; label: string }) => {
            handleOrientationSelect(obj.value)
          }}
          value={orientationValue}
          isSearchable={false}
        />
        <div style={{ fontSize: '12px' }}>
          {input.width}&nbsp;w&nbsp;x&nbsp;{input.height}&nbsp;h
        </div>
        <div className="flex flew-row items-center gap-[8px] ml-[4px]">
          <Button
            className={styles['options-btn']}
            title="Swap dimensions"
            onClick={() => {
              setInput({
                height: input.width,
                orientationType: 'custom',
                width: input.height
              })
            }}
          >
            <IconSwitch2 stroke={1.5} />
          </Button>
          <Button
            className={styles['options-btn']}
            onClick={() => setShowCustomDimensions(true)}
          >
            <IconRuler stroke={1.5} />
          </Button>
          <Button
            className={styles['options-btn']}
            onClick={() => setShowOptions(true)}
          >
            <IconSettings stroke={1.5} />
          </Button>
        </div>
        {showCustomDimensions && (
          <CustomDimensions
            setInput={setInput}
            handleClose={() => setShowCustomDimensions(false)}
          />
        )}
        {showOptions && (
          <DropdownOptions
            handleClose={() => setShowOptions(false)}
            title="Image dimensions"
            top="46px"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '8px 0',
                borderRadius: '4px',
                flexGrow: 1,
                justifyContent: 'space-between'
              }}
            >
              <FlexCol className="flex flex-col w-full gap-2">
                <SubSectionTitle style={{ paddingBottom: 0 }}>
                  <FlexRow>
                    Image dimensions
                    {keepAspectRatio ? (
                      <>
                        <IconLock stroke={1.5} />
                      </>
                    ) : (
                      <>
                        <IconLockOpen stroke={1.5} />
                      </>
                    )}
                    {keepAspectRatio && (
                      <>
                        <TooltipComponent tooltipId={`tooltip-keepRatio`}>
                          Aspect ratio is locked. Adjusting either dimension
                          will update the other dimension accordingly.
                        </TooltipComponent>
                      </>
                    )}
                  </FlexRow>
                </SubSectionTitle>
                <Section style={{ paddingTop: 0 }}>
                  <NumericInputSlider
                    label="Width"
                    from={imageMinSize}
                    to={imageMaxSize}
                    step={STEP_LENGTH}
                    input={input}
                    setInput={setInput}
                    fieldName="width"
                    fullWidth
                    enforceStepValue
                    callback={widthCallback}
                  />
                </Section>

                <Section style={{ paddingTop: 0 }}>
                  <NumericInputSlider
                    label="Height"
                    from={imageMinSize}
                    to={imageMaxSize}
                    step={STEP_LENGTH}
                    input={input}
                    setInput={setInput}
                    fieldName="height"
                    fullWidth
                    enforceStepValue
                    callback={heightCallback}
                  />
                </Section>
                <Section>
                  <div style={{ fontSize: '12px' }}>
                    {input.height * input.width > MAX_WIDTH * MAX_WIDTH && (
                      <div
                        className="text-amber-500"
                        style={{ fontWeight: 700 }}
                      >
                        You will need to have enough kudos to complete this
                        request.
                      </div>
                    )}
                    {input.height * input.width <= MAX_WIDTH * MAX_WIDTH && (
                      <div
                        className="text-gray-400"
                        style={{ fontWeight: 700 }}
                      >
                        High resolution requests require upfront kudos.
                      </div>
                    )}
                  </div>

                  {keepAspectRatio && (
                    <div
                      className={
                        'block text-xs w-full font-bold' +
                        getAspectRatioDeviationColor(getAspectRatioDeviation())
                      }
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Aspect ratio is locked! Deviation from target value:{' '}
                      {(getAspectRatioDeviation() * 100).toFixed(2)}%
                    </div>
                  )}

                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    Height and width must be divisible by {STEP_LENGTH}.
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    Current image size: {getMegapixelSize()} megapixels
                  </div>
                </Section>
              </FlexCol>

              <FlexRow
                style={{
                  columnGap: '8px',
                  marginTop: '8px',
                  justifyContent: 'flex-end'
                }}
              >
                <AspectRatioToggler
                  disabled={input.orientationType === 'random'}
                  keepAspectRatio={keepAspectRatio}
                  toggleKeepAspectRatio={toggleKeepAspectRatio}
                />
                <Button
                  title="Swap dimensions"
                  onClick={() => {
                    if (keepAspectRatio) {
                      setTargetAspectRatio(1 / targetAspectRatio) // Invert target aspect ratio
                    }
                    setInput({
                      height: input.width,
                      orientationType: 'custom',
                      width: input.height
                    })
                  }}
                  style={{ width: 'auto' }}
                >
                  <IconSwitch2 stroke={1.5} />
                  Swap
                </Button>
              </FlexRow>
            </div>
          </DropdownOptions>
        )}
      </FlexRow>
    </OptionsRow>
  )
}

export default ImageOrientationOptions
