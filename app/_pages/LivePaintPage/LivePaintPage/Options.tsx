import ControlNetOptions from 'app/_modules/AdvancedOptionsPanel/ControlNetOptions'
import SelectSampler from 'app/_modules/AdvancedOptionsPanel/SelectSampler'
import SelectModel from 'app/_modules/AdvancedOptionsPanel/SelectModel'
import PromptInput from 'app/_pages/CreatePage/PromptInput'
import Steps from 'app/_modules/AdvancedOptionsPanel/Steps'
import Guidance from 'app/_modules/AdvancedOptionsPanel/Guidance'
import Seed from 'app/_modules/AdvancedOptionsPanel/Seed'
import Denoise from 'app/_modules/AdvancedOptionsPanel/Denoise'
import ClipSkip from 'app/_modules/AdvancedOptionsPanel/ClipSkip'

export const LivePaintOptions = () => {
  return (
    <div className="flex flex-col w-full gap-2">
      <PromptInput />

      <SelectSampler hideOptions />
      <SelectModel hideOptions />

      <ControlNetOptions />
      <Denoise hideOptions />

      <Steps hideOptions />
      <Guidance hideOptions />
      <ClipSkip hideOptions />

      <Seed />
    </div>
  )
}
