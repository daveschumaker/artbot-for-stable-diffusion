import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SelectComponent from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import {
  MAX_DIMENSIONS_LOGGED_IN,
  MAX_DIMENSIONS_LOGGED_OUT
} from '../../../../_constants'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'
import NumericInputSlider from '../NumericInputSlider'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { orientationDetails } from 'utils/imageUtils'

import { Button } from 'components/UI/Button'
import RefreshIcon from 'components/icons/RefreshIcon'
import PencilIcon from 'components/icons/PencilIcon'
import LinkIcon from 'components/icons/LinkIcon'

import { useState } from 'react'

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

interface Props {
  input: DefaultPromptInput
  setInput: any
}

const OrientationOptions = ({ input, setInput}: Props) => {
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
    const details = orientationDetails(orientation, input.height, input.width)

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
    const aspectRatioRatio = Math.max(currentAspectRatio, targetAspectRatio) / Math.min(currentAspectRatio, targetAspectRatio)

    const deviation = Math.abs(aspectRatioRatio - 1)
    return deviation
  }
  

  const getAspectRatioDeviationColor = (aspectRatioDeviation: number) => {
    if (aspectRatioDeviation > 0.25) return 'text-red-500'
    if (aspectRatioDeviation > 0.15) return 'text-amber-500'
    return 'text-gray-500'
  }

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]

  return (
    <Section>
      <SubSectionTitle>Image orientation</SubSectionTitle>
      <MaxWidth maxWidth={480}>
        <div className="flex flex-row items-center gap-2 w-full">
          <div className="flex-1">
            <SelectComponent
              options={orientationOptions}
              onChange={(obj: { value: string; label: string }) => {
                handleOrientationSelect(obj.value)
                setKeepAspectRatio(false)
              }}
              value={orientationValue}
              isSearchable={false}
            />
          </div>
          {input.orientationType !== 'custom' && (
            <div>
              <Button
                title="Customize dimensions"
                disabled={input.orientationType === 'random'}
                onClick={() => {
                  setInput({
                    orientationType: 'custom'
                  })
                }}
              >
                <PencilIcon />
              </Button>
            </div>
          )}
          {input.orientationType === 'custom' && (
            <Button
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
            >
              <RefreshIcon />
            </Button>
          )}
        </div>

        {input.orientationType !== 'custom' &&
          input.orientationType !== 'random' && (
            <div className="block text-xs mt-2 w-full">
              Width: {input.width} Height: {input.height}
            </div>
          )}

        {orientationValue?.value === 'custom' && (
          <>
            <div className="flex flex-column items-center gap-2 w-full">
              <div className="flex-1">
                <Section>
                  <NumericInputSlider
                    label="Width"
                    from={getConstraints().from}
                    to={getConstraints().to}
                    step={64}
                    input={input}
                    setInput={setInput}
                    fieldName="width"
                    initialLoad={false}
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
                    initialLoad={false}
                    fullWidth
                    enforceStepValue
                    callback={heightCallback}
                  />
                </Section>
              </div>

              <div className="flex justify-center items-center">
                <Button
                  title={
                    keepAspectRatio ? 'Free aspect ratio' : 'Lock aspect ratio'
                  }
                  onClick={toggleKeepAspectRatio}
                >
                  <LinkIcon active={keepAspectRatio} />
                </Button>
              </div>
            </div>

            <div className="block text-xs mt-3 w-full">
              {input.height * input.width > 1024 * 1024 && (
                <div className="text-amber-500 font-bold">
                  You will need to have enough kudos to complete this request.
                </div>
              )}
              {input.height * input.width <= 1024 * 1024 && (
                <div className="text-gray-400 font-bold">
                  High resolution requests require upfront kudos.
                </div>
              )}
            </div>

            {keepAspectRatio && (
              <div
                className={
                  'block text-xs w-full font-bold ' +
                  getAspectRatioDeviationColor(getAspectRatioDeviation())
                }
              >
                Aspect ratio is locked! Deviation from target value:{' '}
                {(getAspectRatioDeviation() * 100).toFixed(2)}%
              </div>
            )}

            <div className="block text-xs mt-2 w-full">
              Height and width must be divisible by 64.
            </div>

            <div className="block text-xs w-full">
              Current image size: {getMegapixelSize()} megapixels
            </div>
          </>
        )}
      </MaxWidth>
    </Section>
  )
}

export default OrientationOptions
