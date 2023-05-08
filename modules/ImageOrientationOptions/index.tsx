import { Dispatch } from 'react'
import { useState } from 'react'
import { useStore } from 'statery'
import {
  IconLock,
  IconLockOpen,
  IconPencil,
  IconSwitch2
} from '@tabler/icons-react'

import TooltipComponent from '../../components/Tooltip'
import { userInfoStore } from 'store/userStore'
import { MAX_DIMENSIONS_LOGGED_IN, MAX_DIMENSIONS_LOGGED_OUT } from '_constants'
import { ImageOrientation } from 'controllers/ImageOrientation'
import Section from 'components/UI/Section'
import MaxWidth from 'components/UI/MaxWidth'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import SelectComponent from 'components/UI/Select'
import { Button } from 'components/UI/Button'
import NumericInputSlider from 'components/CreatePage/AdvancedOptionsPanel/NumericInputSlider'
import DefaultPromptInput from 'models/DefaultPromptInput'

interface ModifiedInput {
  height: number
  width: number
  orientationType: string
}

const ImageOrientationOptions = ({
  input,
  setInput
}: {
  input: ModifiedInput
  setInput: Dispatch<Partial<DefaultPromptInput>>
}) => {
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

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

  const [keepAspectRatio, setKeepAspectRatio] = useState(false)
  const [targetAspectRatio, setTargetAspectRatio] = useState(0)

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
        height: nearestHeight
      })
    }
  }

  const heightCallback = (value: number) => {
    if (keepAspectRatio) {
      const { from, to } = getConstraints()

      let nearestWidth = Math.round((value * targetAspectRatio) / 64) * 64
      nearestWidth = Math.min(nearestWidth, to)
      nearestWidth = Math.max(nearestWidth, from)

      setInput({
        width: nearestWidth
      })
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
    (option) => {
      return input.orientationType === option.value
    }
  )[0]

  return (
    <Section>
      <MaxWidth width="480px">
        <SubSectionTitle>Image orientation</SubSectionTitle>
        <div className="flex flex-row items-center w-full gap-2 mb-2">
          <SelectComponent
            options={ImageOrientation.dropdownOptions()}
            onChange={(obj: { value: string; label: string }) => {
              handleOrientationSelect(obj.value)
              setKeepAspectRatio(false)
            }}
            value={orientationValue}
            isSearchable={false}
          />
        </div>
        <div className="flex flex-row items-center w-full gap-2 mb-2">
          {orientationValue?.value !== 'custom' && (
            <Button
              size="small"
              title="Customize dimensions"
              disabled={input.orientationType === 'random'}
              onClick={() => {
                setInput({
                  orientationType: 'custom'
                })
              }}
              style={{
                width: '240px'
              }}
            >
              <IconPencil stroke={1.5} />
              Edit dimensions
            </Button>
          )}

          {orientationValue?.value === 'custom' && (
            <Button
              size="small"
              title={
                keepAspectRatio ? 'Free aspect ratio' : 'Lock aspect ratio'
              }
              disabled={input.orientationType === 'random'}
              onClick={toggleKeepAspectRatio}
              style={{ width: '150px' }}
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
          )}
          {orientationValue?.value === 'custom' && (
            <Button
              size="small"
              title="Swap dimensions"
              onClick={() => {
                if (keepAspectRatio) {
                  setTargetAspectRatio(1 / targetAspectRatio) // Invert target aspect ratio
                }
                setInput({
                  height: input.width,
                  width: input.height
                })
              }}
              style={{ width: '100px' }}
            >
              <IconSwitch2 stroke={1.5} />
              Swap
            </Button>
          )}
          {input.orientationType !== 'custom' &&
            input.orientationType !== 'random' && (
              <div className="flex flex-row justify-end w-full text-sm">
                <strong>{input.width}</strong>px (width)&nbsp;/&nbsp;
                <strong>{input.height}</strong>px (height)
              </div>
            )}
        </div>

        {orientationValue?.value === 'custom' && (
          <div
            style={{
              border: '1px solid rgb(126, 90, 108)',
              padding: '8px 16px',
              borderRadius: '4px'
            }}
          >
            <div className="flex flex-col w-full gap-2">
              <SubSectionTitle>
                <div className="flex flex-row gap-4">
                  Custom dimensions
                  {keepAspectRatio ? (
                    <>
                      <TooltipComponent targetId={`tooltip-keepRatio`}>
                        Aspect ratio is locked. Adjusting either dimension will
                        update the other dimension accordingly.
                      </TooltipComponent>
                      <IconLock id="tooltip-keepRatio" stroke={1.5} />
                    </>
                  ) : (
                    <IconLockOpen id="tooltip-keepRatio" stroke={1.5} />
                  )}
                </div>
              </SubSectionTitle>
              <Section>
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

              <Section>
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
            </div>

            <div className="block w-full mt-3 text-xs">
              {input.height * input.width > 1024 * 1024 && (
                <div className="font-bold text-amber-500">
                  You will need to have enough kudos to complete this request.
                </div>
              )}
              {input.height * input.width <= 1024 * 1024 && (
                <div className="font-bold text-gray-400">
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
              >
                Aspect ratio is locked! Deviation from target value:{' '}
                {(getAspectRatioDeviation() * 100).toFixed(2)}%
              </div>
            )}

            <div
              className="block w-full mt-2 text-xs"
              style={{ marginTop: '8px' }}
            >
              Height and width must be divisible by 64.
            </div>

            <div className="block w-full text-xs">
              Current image size: {getMegapixelSize()} megapixels
            </div>
          </div>
        )}
      </MaxWidth>
    </Section>
  )
}

export default ImageOrientationOptions
