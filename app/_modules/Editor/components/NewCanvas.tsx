import { useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import { ORIENTATION_OPTIONS } from '_constants'
import { IOrientation } from '_types'
import {
  calculateAspectRatioFit,
  nearestWholeMultiple
} from 'app/_utils/imageUtils'
import { Button } from 'app/_components/Button'
import PageTitle from 'app/_components/PageTitle'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import InteractiveModal from 'app/_components/InteractiveModal/interactiveModal'
import { IconX } from '@tabler/icons-react'

const NewCanvas = ({
  handleClose = () => {},
  handleOnCreateClick = () => {}
}: {
  handleClose: () => void
  handleOnCreateClick: (obj: {
    height: number
    width: number
    bgColor: string
  }) => void
}) => {
  const [color, setColor] = useState('#ffffff')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [orientationValue, setOrientationValue] = useState<IOrientation>({
    value: 'square',
    label: 'Square',
    height: 1,
    width: 1
  })

  const filterOrientations = ORIENTATION_OPTIONS.filter((obj) => {
    return obj.value !== 'custom' && obj.value !== 'random'
  })

  return (
    <InteractiveModal
      handleClose={handleClose}
      maxWidth="480px"
      setDynamicHeight={340}
    >
      <div className="px-4">
        <PageTitle>New canvas</PageTitle>
        <div>
          <SubSectionTitle>
            Select orientation
            <div className="mb-2 text-sm font-[400]">
              Note: Image size will be scaled to your device&apos;s current
              viewport.
            </div>
          </SubSectionTitle>
          <Select
            className="z-30"
            options={filterOrientations}
            onChange={(obj: IOrientation) => {
              setOrientationValue(obj)
            }}
            value={orientationValue}
            isSearchable={false}
          />
        </div>
        <div className="mt-2 flex flex-row gap-2 items-center">
          <div className="font-[700]">Background color</div>
          <div
            className="w-[50px] h-[30px] rounded border border-black cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => {
              if (showColorPicker) {
                setShowColorPicker(false)
              } else {
                setShowColorPicker(true)
              }
            }}
          ></div>
        </div>
        {showColorPicker && (
          <div className="mt-4 flex flex-row w-full justify-center gap-2">
            <HexAlphaColorPicker
              color={color}
              onChange={(value: string) => {
                setColor(value)
              }}
            />
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowColorPicker(false)
              }}
            >
              <IconX />
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-row items-center justify-center gap-2">
          <Button
            onClick={() => {
              if (orientationValue.height && orientationValue.width) {
                // get width of canvas area
                let container = document.querySelector('#canvas-wrapper')
                // @ts-ignore
                const canvasWidth = container?.offsetWidth || 512

                // Attempt to pin narrow margin to 512
                // due to potential worker constraints on image sizes
                let maxWidth = canvasWidth > 1024 ? 1024 : canvasWidth
                let maxHeight = 1024

                if (orientationValue.width > orientationValue.height) {
                  maxHeight = 512
                }

                if (orientationValue.width < orientationValue.height) {
                  maxWidth = 512
                  maxHeight = 1024
                }

                if (orientationValue.width === orientationValue.height) {
                  maxWidth = 512
                  maxHeight = 512
                }

                const resized = calculateAspectRatioFit(
                  orientationValue.width,
                  orientationValue.height,
                  maxWidth,
                  maxHeight
                )

                handleOnCreateClick({
                  height: nearestWholeMultiple(resized.height),
                  width: nearestWholeMultiple(resized.width),
                  bgColor: color
                })
              }
            }}
            width="280px"
          >
            Create
          </Button>
        </div>
      </div>
    </InteractiveModal>
  )
}

export default NewCanvas
