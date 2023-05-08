import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SelectComponent from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TwoPanel from 'components/UI/TwoPanel'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { CONTROL_TYPE_ARRAY } from '../../../../_constants'
import InputSwitch from '../InputSwitch'
import SplitPanel from 'components/UI/SplitPanel'

const ControlNetOptions = ({
  forceDisplay = false,
  hideControlMap = false,
  input,
  setInput
}: {
  forceDisplay?: boolean
  hideControlMap?: boolean
  input: DefaultPromptInput
  setInput: any
}) => {
  let controlTypeValue = { value: '', label: 'none' }

  if (CONTROL_TYPE_ARRAY.indexOf(input.control_type) >= 0) {
    if (input.control_type) {
      controlTypeValue = {
        value: input.control_type,
        label: input.control_type
      }
    }
  }

  const handleControlMapSelect = (option: string) => {
    if (option === 'image_is_control' && input.image_is_control) {
      return setInput({ image_is_control: false })
    } else if (option === 'image_is_control') {
      setInput({ image_is_control: true })
      setInput({ return_control_map: false })
      return
    }

    if (option === 'return_control_map' && input.return_control_map) {
      return setInput({ return_control_map: false })
    } else if (option == 'return_control_map') {
      setInput({ return_control_map: true })
      setInput({ image_is_control: false })
      return
    }
  }

  const isDisabled = !input.source_image && !forceDisplay

  return (
    <div>
      <Section>
        <SubSectionTitle>Control Type</SubSectionTitle>
        {isDisabled && !forceDisplay && (
          <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
            <MaxWidth
              // @ts-ignore
              width="360px"
            >
              <strong>Note:</strong> ControlNet can only be used for img2img
              requests. Please upload an image to use this feature.
            </MaxWidth>
          </div>
        )}
        {(input.source_image || forceDisplay) && (
          <div className="max-w-[384px] w-full">
            <SelectComponent
              isDisabled={isDisabled}
              options={CONTROL_TYPE_ARRAY.map((value) => {
                if (value === '') {
                  return { value: '', label: 'none' }
                }

                return { value, label: value }
              })}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ control_type: obj.value })

                if (obj.value !== '') {
                  setInput({ karras: false, hires: false })
                }
              }}
              isSearchable={false}
              value={
                controlTypeValue
                  ? controlTypeValue
                  : { value: '', label: 'none' }
              }
            />
          </div>
        )}
      </Section>
      {!isDisabled && !hideControlMap && (
        <TwoPanel>
          <SplitPanel>
            <InputSwitch
              label="Return control map?"
              disabled={!input.control_type}
              tooltip="This option returns the control map / depth map for a given image."
              checked={input.return_control_map}
              handleSwitchToggle={() =>
                handleControlMapSelect('return_control_map')
              }
              moreInfoLink={
                input.control_type ? null : (
                  <div className="text-slate-500 dark:text-slate-400">
                    Select a control type to enable this option.
                  </div>
                )
              }
            />
          </SplitPanel>

          <SplitPanel>
            <InputSwitch
              label="Use control map?"
              disabled={!input.control_type}
              tooltip="Tell Stable Horde that the image you're uploading is a control map."
              checked={input.image_is_control}
              handleSwitchToggle={() =>
                handleControlMapSelect('image_is_control')
              }
              moreInfoLink={
                input.control_type ? null : (
                  <div className="text-slate-500 dark:text-slate-400">
                    Select a control type to enable this option.
                  </div>
                )
              }
            />
          </SplitPanel>
        </TwoPanel>
      )}
    </div>
  )
}

export default ControlNetOptions
