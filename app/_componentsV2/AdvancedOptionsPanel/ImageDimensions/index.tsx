'use client'

import { IconRuler } from '@tabler/icons-react'
import NumberInput from 'app/_componentsV2/NumberInput'
import { useInput } from 'app/_modules/InputProvider/context'

const MIN_IMAGES = 1
const MAX_IMAGES = 200

export default function ImageDimensions() {
  const { input, setInput } = useInput()

  return (
    <>
      <details
        className="collapse collapse-arrow mb-5"
        // open={negativePanelOpen}
      >
        <summary className="collapse-title text-xl font-medium p-0 py-1 min-h-0">
          <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full select-none">
            <IconRuler stroke={1.5} size={20} />
            Image Dimensions{' '}
          </div>
        </summary>
        <div
          className={
            'collapse-content mt-2 p-0 w-full flex flex-col align-middle gap-2'
          }
        >
          <div className="flex flex-row gap-4 items-center">
            <div className=" min-w-[70px]">Height</div>
            <input
              type="range"
              min={MIN_IMAGES}
              max={MAX_IMAGES}
              step={1}
              onChange={(e: any) => {
                setInput({ numImages: e.target.value })
              }}
              value={input.numImages}
              className="range range-primary range-xs"
            />
            <NumberInput
              min={MIN_IMAGES}
              max={MAX_IMAGES}
              onChange={(e: any) => {
                setInput({ numImages: e.target.value })
              }}
              onMinusClick={() => {
                if (Number(input.numImages) <= MIN_IMAGES) {
                  setInput({ numImages: MIN_IMAGES })
                } else {
                  setInput({ numImages: Number(input.numImages) - 1 })
                }
              }}
              onPlusClick={() => {
                if (Number(input.numImages) >= MAX_IMAGES) {
                  setInput({ numImages: MAX_IMAGES })
                } else {
                  setInput({ numImages: Number(input.numImages) + 1 })
                }
              }}
              value={input.numImages}
            />
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className=" min-w-[70px]">Width</div>
            <input
              type="range"
              min={MIN_IMAGES}
              max={MAX_IMAGES}
              step={1}
              onChange={(e: any) => {
                setInput({ numImages: e.target.value })
              }}
              value={input.numImages}
              className="range range-primary range-xs"
            />
            <NumberInput
              min={MIN_IMAGES}
              max={MAX_IMAGES}
              onChange={(e: any) => {
                setInput({ numImages: e.target.value })
              }}
              onMinusClick={() => {
                if (Number(input.numImages) <= MIN_IMAGES) {
                  setInput({ numImages: MIN_IMAGES })
                } else {
                  setInput({ numImages: Number(input.numImages) - 1 })
                }
              }}
              onPlusClick={() => {
                if (Number(input.numImages) >= MAX_IMAGES) {
                  setInput({ numImages: MAX_IMAGES })
                } else {
                  setInput({ numImages: Number(input.numImages) + 1 })
                }
              }}
              value={input.numImages}
            />
          </div>
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="toggle"
              // checked={stayOnCreate}
              onClick={() => {
                // AppSettings.set('stayOnCreate', !stayOnCreate)
                // setStayOnCreate(!stayOnCreate)
              }}
            />
            <span className="label-text">Lock aspect ratio?</span>
          </label>
        </div>
      </details>
    </>
  )
}
