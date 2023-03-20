import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SelectComponent from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import {
  MAX_DIMENSIONS_LOGGED_IN,
  MAX_DIMENSIONS_LOGGED_OUT
} from '../../../../constants'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'
import NumericInputSlider from '../NumericInputSlider'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { orientationDetails } from 'utils/imageUtils'

import { Button } from 'components/UI/Button'
import RefreshIcon from 'components/icons/RefreshIcon'
import PencilIcon from 'components/icons/PencilIcon'

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
  setErrorMessage: any
}

const OrientationOptions = ({ input, setInput, setErrorMessage }: Props) => {
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

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

                if (obj.value !== 'custom') {
                  setErrorMessage({ height: null, width: null })
                }
              }}
              value={orientationValue}
              isSearchable={false}
            />
          </div>
          {input.orientationType !== 'custom' && (   
            <div>
              <Button
                title="Customize dimensions"
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
        </div>

        {
          input.orientationType !== 'custom' && (
            <div className="block text-xs mt-2 w-full">
              Width: {input.width} Height: {input.height}
            </div>
          )
        }

        {orientationValue?.value === 'custom' && (
          <>
            <div className="flex flex-column items-center gap-2 w-full">
              <div className="flex-1">
                <Section>
                  <NumericInputSlider
                    label="Width"
                    from={64}
                    to={
                      loggedIn === true
                        ? MAX_DIMENSIONS_LOGGED_IN
                        : MAX_DIMENSIONS_LOGGED_OUT
                    }
                    step={64}
                    input={input}
                    setInput={setInput}
                    fieldName="width"
                    initialLoad={false}
                    fullWidth
                    enforceStepValue
                  />
                </Section>

                <Section>
                  <NumericInputSlider
                    label="Height"
                    from={64}
                    to={
                      loggedIn === true
                        ? MAX_DIMENSIONS_LOGGED_IN
                        : MAX_DIMENSIONS_LOGGED_OUT
                    }
                    step={64}
                    input={input}
                    setInput={setInput}
                    fieldName="height"
                    initialLoad={false}
                    fullWidth
                    enforceStepValue
                  />
                </Section>
              </div>
              <div className="flex justify-center items-center">
                <Button
                  title="Swap dimensions"
                  onClick={() => {
                    setInput({
                      height: input.width,
                      width: input.height
                    })
                  }}
                >
                  <RefreshIcon />
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
                  Requests larger than 1 megapixel require upfront kudos.
                </div>
              )}
            </div>

            <div className="block text-xs mt-2 w-full">
              Height and width must be divisible by 64.
            </div>

            <div className="block text-xs w-full">
              Current image size: {getMegapixelSize()} megapixels
            </div>

            {
              // TODO: Show current aspect ratio here
            }
          </>
        )}
      </MaxWidth>
    </Section>
  )
}

export default OrientationOptions
