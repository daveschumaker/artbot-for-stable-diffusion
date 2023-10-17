import { useCallback, useEffect, useState } from 'react'
import {
  IconLock,
  IconLockOpen,
  IconRuler,
  IconSettings,
  IconSwitch2
} from '@tabler/icons-react'

import Section from 'app/_components/Section'
import { GetSetPromptInput } from '_types/artbot'
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

const MAX_WIDTH = 1024
const MIN_WIDTH = 64
const STEP_LENGTH = 64

const ImageOrientationOptions = ({ input, setInput }: GetSetPromptInput) => {
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
      newWidth = Math.floor(newWidth / MIN_WIDTH) * MIN_WIDTH
      newHeight = Math.floor(newHeight / MIN_WIDTH) * MIN_WIDTH

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

  const widthCallback = (value: number) => {
    if (keepAspectRatio) {
      let nearestHeight =
        Math.round(value / targetAspectRatio / MIN_WIDTH) * MIN_WIDTH
      nearestHeight = Math.min(nearestHeight, imageMaxSize)
      nearestHeight = Math.max(nearestHeight, imageMinSize)

      setInput({
        height: nearestHeight,
        width: value
      })
    } else if (input.orientationType !== 'custom' && !keepAspectRatio) {
      setInput({ orientationType: 'custom' })
    }
  }

  const heightCallback = (value: number) => {
    if (keepAspectRatio) {
      let nearestWidth =
        Math.round((value * targetAspectRatio) / MIN_WIDTH) * MIN_WIDTH
      nearestWidth = Math.min(nearestWidth, imageMaxSize)
      nearestWidth = Math.max(nearestWidth, imageMinSize)

      setInput({
        height: value,
        width: nearestWidth
      })
    } else if (input.orientationType !== 'custom' && !keepAspectRatio) {
      setInput({ orientationType: 'custom' })
    }
  }

  const orientationValue = ImageOrientation.dropdownOptions({
    baseline
  }).filter((option: any) => {
    return input.orientationType === option.value
  })[0]

  const totalPixels = input.height * input.width

  // Lock aspect ratio on initial run if orientation type is not custom
  useEffect(() => {
    if (input.orientationType !== 'custom') {
      setTargetAspectRatio(getCurrentAspectRatio())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Section
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: 0,
        position: 'relative'
      }}
    >
      <SubSectionTitle>Image orientation</SubSectionTitle>
      {
        // @ts-ignore
        workerDetails && totalPixels > workerDetails.max_pixels && (
          <FlexRow className="gap-2 mb-2 text-red-600 text-[14px] font-[700]">
            Warning: These dimensions exceed the max_pixels for your targeted
            worker. Reduce resolution or remove targeted worker.
          </FlexRow>
        )
      }
      <FlexRow style={{ marginBottom: '4px' }}>
        <Select
          options={ImageOrientation.dropdownOptions({ baseline })}
          onChange={(obj: { value: string; label: string }) => {
            handleOrientationSelect(obj.value)
          }}
          value={orientationValue}
          isSearchable={false}
        />
      </FlexRow>
      <FlexRow
        style={{
          justifyContent: 'space-between',
          marginBottom: '4px',
          position: 'relative'
        }}
      >
        <FlexRow style={{ fontSize: '12px', paddingLeft: '2px' }}>
          {input.width} w x {input.height} h
        </FlexRow>
        <FlexRow gap={4} style={{ justifyContent: 'flex-end' }}>
          <Button
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
          <Button onClick={() => setShowCustomDimensions(true)}>
            <IconRuler stroke={1.5} />
          </Button>
          <Button onClick={() => setShowOptions(true)}>
            <IconSettings stroke={1.5} />
          </Button>
        </FlexRow>
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
                <Button
                  title={
                    keepAspectRatio ? 'Free aspect ratio' : 'Lock aspect ratio'
                  }
                  disabled={input.orientationType === 'random'}
                  onClick={toggleKeepAspectRatio}
                  style={{ width: '125px' }}
                >
                  {keepAspectRatio ? (
                    <>
                      <IconLock stroke={1.5} />
                      Unlock ratio
                    </>
                  ) : (
                    <>
                      <IconLockOpen stroke={1.5} />
                      Lock ratio
                    </>
                  )}
                </Button>
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
    </Section>
  )
}

export default ImageOrientationOptions
