import ControlNetOptions from 'app/_modules/AdvancedOptionsPanel/ControlNetOptions'
import NumericInputSlider from 'app/_modules/AdvancedOptionsPanel/NumericInputSlider'
import SelectSampler from 'app/_modules/AdvancedOptionsPanel/SelectSampler'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
// import { useStore } from 'statery'
// import { userInfoStore } from 'store/userStore'
import PromptInput from 'app/_pages/CreatePage/PromptInput'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import Steps from 'app/_modules/AdvancedOptionsPanel/Steps'
import Guidance from 'app/_modules/AdvancedOptionsPanel/Guidance'
import Seed from 'app/_modules/AdvancedOptionsPanel/Seed'
import SelectModelDetails from 'app/_modules/AdvancedOptionsPanel/ModelDetails/modelDetails'
import Denoise from 'app/_modules/AdvancedOptionsPanel/Denoise'
import ClipSkip from 'app/_modules/AdvancedOptionsPanel/ClipSkip'

export const LivePaintOptions = ({ input, setInput }: any) => {
  // const userState = useStore(userInfoStore)
  // const { loggedIn } = userState

  return (
    <div className="flex flex-col w-full gap-2">
      <PromptInput input={input} setInput={setInput} />

      <FlexibleRow>
        <FlexibleUnit>
          <SelectSampler input={input} setInput={setInput} hideOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <Denoise input={input} setInput={setInput} hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <Steps input={input} setInput={setInput} hideOptions />
        </FlexibleUnit>
        <FlexibleUnit>
          <Guidance input={input} setInput={setInput} hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow style={{ paddingTop: '8px' }}>
        <FlexibleUnit>
          <ControlNetOptions input={input} setInput={setInput} />
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
              input.models &&
              input.models[0] &&
              input.models[0].indexOf('_inpainting') >= 0
            }
          />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <Seed input={input} setInput={setInput} />
        </FlexibleUnit>
        <FlexibleUnit>
          <ClipSkip input={input} setInput={setInput} hideOptions />
        </FlexibleUnit>
      </FlexibleRow>

      <FlexibleRow>
        <FlexibleUnit>
          <SelectModel input={input} setInput={setInput} hideOptions />
          <SelectModelDetails
            models={input.models}
            multiModels={input.useAllModels || input.useFavoriteModels}
          />
        </FlexibleUnit>
        <FlexibleUnit>
          <div></div>
        </FlexibleUnit>
      </FlexibleRow>
    </div>
  )
}
