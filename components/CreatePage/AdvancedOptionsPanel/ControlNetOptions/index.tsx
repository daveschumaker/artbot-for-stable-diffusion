import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SelectComponent from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { CONTROL_TYPE_ARRAY } from '../../../../constants'
import InputSwitch from '../InputSwitch'

const ControlNetOptions = ({
  input,
  setInput
}: {
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

  const isDisabled = !input.source_image

  return (
    <div>
      <Section>
        <SubSectionTitle>Control Type</SubSectionTitle>
        {isDisabled && (
          <div className="mt-[-6px] text-sm text-slate-500 dark:text-slate-400 font-[600]">
            <MaxWidth
              // @ts-ignore
              maxWidth="360"
            >
              <strong>Note:</strong> ControlNet can only be used for img2img
              requests. Please upload an image to use this feature.
            </MaxWidth>
          </div>
        )}
        {input.source_image && (
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
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
          </MaxWidth>
        )}
        {!isDisabled && (
          <>
            <InputSwitch
              label="Return control map?"
              tooltip="This option returns the control map / depth map for a given image."
              checked={input.return_control_map}
              handleSwitchToggle={() =>
                handleControlMapSelect('return_control_map')
              }
            />
            <InputSwitch
              label="Use control map?"
              tooltip="Tell Stable Horde that the image you're uploading is a control map."
              checked={input.image_is_control}
              handleSwitchToggle={() => handleControlMapSelect('image_is_control')}
            />
          </>
        )}

      </Section>
    </div>
  )
}

export default ControlNetOptions
