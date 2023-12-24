'use client'

import { IconAdjustmentsHorizontal } from '@tabler/icons-react'
import NumberInput from 'app/_componentsV2/NumberInput'
import { useInput } from 'app/_modules/InputProvider/context'
import { userInfoStore } from 'app/_store/userStore'
import { maxSteps } from 'app/_utils/validationUtils'
import { useStore } from 'statery'

const MIN_IMAGES = 1
const MAX_IMAGES = 200

export default function ImageParameters() {
  const { input, setInput } = useInput()

  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const MAX_STEPS = maxSteps({
    sampler: input.sampler,
    loggedIn: loggedIn === true ? true : false,
    isSlider: true
  })

  return (
    <>
      <details
        className="collapse collapse-arrow mb-5"
        // open={negativePanelOpen}
      >
        <summary className="collapse-title text-xl font-medium p-0 py-1 min-h-0">
          <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full select-none">
            <IconAdjustmentsHorizontal stroke={1.5} size={20} />
            Generation Parameters{' '}
          </div>
        </summary>
        <div
          className={
            'collapse-content mt-2 p-0 w-full flex flex-col align-middle gap-2'
          }
        >
          <div className="flex flex-row gap-4 items-center">
            <div className=" min-w-[70px]">Images</div>
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
            <div className=" min-w-[70px]">Steps</div>
            <input
              type="range"
              min={1}
              max={MAX_STEPS}
              step={1}
              onChange={(e: any) => {
                setInput({ steps: e.target.value })
              }}
              value={input.steps}
              className="range range-primary range-xs"
            />
            <NumberInput
              min={1}
              max={MAX_STEPS}
              onChange={(e: any) => {
                setInput({ steps: e.target.value })
              }}
              onMinusClick={() => {
                if (Number(input.steps) <= 1) {
                  setInput({ steps: 1 })
                } else {
                  setInput({ steps: Number(input.steps) - 1 })
                }
              }}
              onPlusClick={() => {
                if (Number(input.steps) >= MAX_STEPS) {
                  setInput({ steps: MAX_STEPS })
                } else {
                  setInput({ steps: Number(input.steps) + 1 })
                }
              }}
              value={input.steps}
            />
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className=" min-w-[70px]">Guidance</div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.5}
              onChange={(e: any) => {
                setInput({ cfg_scale: e.target.value })
              }}
              value={input.cfg_scale}
              className="range range-primary range-xs"
            />
            <NumberInput
              min={1}
              max={30}
              onChange={(e: any) => {
                setInput({ cfg_scale: e.target.value })
              }}
              onMinusClick={() => {
                if (Number(input.cfg_scale) <= 1) {
                  setInput({ cfg_scale: 1 })
                } else {
                  setInput({ cfg_scale: Number(input.cfg_scale) - 0.5 })
                }
              }}
              onPlusClick={() => {
                if (Number(input.cfg_scale) >= 30) {
                  setInput({ cfg_scale: 30 })
                } else {
                  setInput({ cfg_scale: Number(input.cfg_scale) + 0.5 })
                }
              }}
              value={input.cfg_scale}
            />
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className=" min-w-[70px]">Seed</div>
            <input
              className="input input-bordered input-md md:input-sm max-w-[180px] text-left"
              onChange={(e: any) => {
                setInput({ seed: e.target.value })
              }}
              value={input.seed}
            />
          </div>
        </div>
      </details>
    </>
  )
}
