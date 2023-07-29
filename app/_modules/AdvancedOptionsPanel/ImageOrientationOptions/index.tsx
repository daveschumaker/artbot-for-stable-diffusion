import { useEffect, useState } from 'react'
import { useStore } from 'statery'
import {
  IconLock,
  IconLockOpen,
  IconRuler,
  IconSettings,
  IconSwitch2
} from '@tabler/icons-react'

import { MAX_DIMENSIONS_LOGGED_IN, MAX_DIMENSIONS_LOGGED_OUT } from '_constants'
import Section from 'app/_components/Section'
import { GetSetPromptInput } from 'types/artbot'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import Select from 'app/_components/Select'
import { Button } from 'components/UI/Button'
import useWorkerDetails from 'hooks/useWorkerDetails'
import FlexRow from 'app/_components/FlexRow'
import FlexCol from 'app/_components/FlexCol'
import { ImageOrientation } from 'models/ImageOrientation'
import { userInfoStore } from 'store/userStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import DropdownOptions from 'app/_modules/DropdownOptions'
import CustomDimensions from './CustomDimensions'

const ImageOrientationOptions = ({ input, setInput }: GetSetPromptInput) => {
  const [workerDetails] = useWorkerDetails()
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState
  const [keepAspectRatio, setKeepAspectRatio] = useState(false)
  const [targetAspectRatio, setTargetAspectRatio] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [showCustomDimensions, setShowCustomDimensions] = useState(false)

  const getConstraints = () => {
    return {
      from: 64,
      to:
        loggedIn === true ? MAX_DIMENSIONS_LOGGED_IN : MAX_DIMENSIONS_LOGGED_OUT
    }
  }

  const handleOrientationSelect = (orientation: string) => {
    const details = ImageOrientation.getOrientationDetails(
      orientation,
      input.height,
      input.width
    )

    // Automatically keep aspect ratio
    if (orientation !== 'custom') {
      setKeepAspectRatio(true)
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
    const megapixel = 1024 * 1024
    return (size / megapixel).toFixed(2)
  }

  const toggleKeepAspectRatio = () => {
    if (!keepAspectRatio) {
      setTargetAspectRatio(input.width / input.height)
    } else {
      setTargetAspectRatio(0)
    }
    setKeepAspectRatio(!keepAspectRatio)
  }

  const widthCallback = (value: number) => {
    if (keepAspectRatio) {
      const { from, to } = getConstraints()

      let nearestHeight = Math.round(value / targetAspectRatio / 64) * 64
      nearestHeight = Math.min(nearestHeight, to)
      nearestHeight = Math.max(nearestHeight, from)

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
      const { from, to } = getConstraints()

      let nearestWidth = Math.round((value * targetAspectRatio) / 64) * 64
      nearestWidth = Math.min(nearestWidth, to)
      nearestWidth = Math.max(nearestWidth, from)

      setInput({
        height: value,
        width: nearestWidth
      })
    } else if (input.orientationType !== 'custom' && !keepAspectRatio) {
      setInput({ orientationType: 'custom' })
    }
  }

  const getAspectRatioDeviation = () => {
    if (!keepAspectRatio) {
      return 0
    }

    const { width, height } = input
    const currentAspectRatio = width / height
    const aspectRatioRatio =
      Math.max(currentAspectRatio, targetAspectRatio) /
      Math.min(currentAspectRatio, targetAspectRatio)

    const deviation = Math.abs(aspectRatioRatio - 1)
    return deviation
  }

  const getAspectRatioDeviationColor = (aspectRatioDeviation: number) => {
    if (aspectRatioDeviation > 0.25) return 'text-red-500'
    if (aspectRatioDeviation > 0.15) return 'text-amber-500'
    return 'text-gray-500'
  }

  const orientationValue = ImageOrientation.dropdownOptions().filter(
    (option: any) => {
      return input.orientationType === option.value
    }
  )[0]

  const totalPixels = input.height * input.width

  // Lock aspect ratio on initial run if orientation type is not custom
  useEffect(() => {
    if (input.orientationType !== 'custom') {
      setKeepAspectRatio(true)
      setTargetAspectRatio(input.width / input.height)
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
          options={ImageOrientation.dropdownOptions()}
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
          <Button onClick={() => setShowCustomDimensions(true)}>
            <IconRuler />
          </Button>
          <Button onClick={() => setShowOptions(true)}>
            <IconSettings />
          </Button>
        </FlexRow>
        {showCustomDimensions && (
          <CustomDimensions
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
                    from={getConstraints().from}
                    to={getConstraints().to}
                    step={64}
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
                    from={getConstraints().from}
                    to={getConstraints().to}
                    step={64}
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
                    {input.height * input.width > 1024 * 1024 && (
                      <div
                        className="text-amber-500"
                        style={{ fontWeight: 700 }}
                      >
                        You will need to have enough kudos to complete this
                        request.
                      </div>
                    )}
                    {input.height * input.width <= 1024 * 1024 && (
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
                    Height and width must be divisible by 64.
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
