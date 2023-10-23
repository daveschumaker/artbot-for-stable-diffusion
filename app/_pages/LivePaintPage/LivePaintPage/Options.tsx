import ControlNetOptions from 'app/_modules/AdvancedOptionsPanel/ControlNetOptions'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import SelectSampler from 'app/_modules/AdvancedOptionsPanel/SelectSampler'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
// import { useStore } from 'statery'
// import { userInfoStore } from 'app/_store/userStore'
import PromptInput from 'app/_pages/CreatePage/PromptInput'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import Steps from 'app/_modules/AdvancedOptionsPanel/Steps'
import Guidance from 'app/_modules/AdvancedOptionsPanel/Guidance'
import Seed from 'app/_modules/AdvancedOptionsPanel/Seed'
import Denoise from 'app/_modules/AdvancedOptionsPanel/Denoise'
import ClipSkip from 'app/_modules/AdvancedOptionsPanel/ClipSkip'
import { useInput } from 'app/_modules/InputProvider/context'

export const LivePaintOptions = () => {
  const { input, setInput } = useInput()

  return (
    <div className="flex flex-col w-full gap-2">
      <PromptInput />

      <FlexibleRow>
        <FlexibleUnit>
          <SelectSampler hideOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <Denoise hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <Steps hideOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <Guidance hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow style={{ paddingTop: '8px' }}>
        <FlexibleUnit>
          <ControlNetOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <NumericInputSlider
            label="Denoise"
            tooltip="Amount of noise added to input image. Values that
                  approach 1.0 allow for lots of variations but will
                  also produce images that are not semantically
                  consistent with the input. Only available for img2img."
            from={0.0}
            to={1.0}
            step={0.05}
            input={input}
            setInput={setInput}
            fieldName="denoising_strength"
            disabled={
              (input.models &&
                input.models[0] &&
                input.models[0].indexOf('_inpainting') >= 0) ||
              false
            }
          />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <Seed />
        </FlexibleUnit>
        <FlexibleUnit>
          <ClipSkip hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <SelectModel hideOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <div></div>
        </FlexibleUnit>
      </FlexibleRow>
    </div>
  )
}
