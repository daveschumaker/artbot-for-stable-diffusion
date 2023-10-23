import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { CONTROL_TYPE_ARRAY } from '../../../../_constants'
import FlexRow from 'app/_components/FlexRow'
import { Button } from 'app/_components/Button'
import { IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useInput } from 'app/_modules/InputProvider/context'

const ControlNetOptions = () => {
  const { input, setInput } = useInput()
  const [showDropdown, setShowDropdown] = useState(false)
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

  return (
    <div>
      <SubSectionTitle>Control Type</SubSectionTitle>
      <FlexRow gap={4} style={{ position: 'relative' }}>
        <Select
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
            controlTypeValue ? controlTypeValue : { value: '', label: 'none' }
          }
        />
        {showDropdown && (
          <DropdownOptions
            handleClose={() => setShowDropdown(false)}
            title="Sampler options"
            top="46px"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: '8px',
                padding: '8px 0'
              }}
            >
              <FlexRow>
                <Checkbox
                  label="Return control map?"
                  checked={input.return_control_map}
                  onChange={() => {
                    handleControlMapSelect('return_control_map')
                  }}
                />
                <TooltipComponent tooltipId="return_control_map">
                  <>
                    This option returns the control map / depth map for a given
                    image.
                  </>
                </TooltipComponent>
              </FlexRow>
              <FlexRow>
                <Checkbox
                  label="Use control map?"
                  checked={input.image_is_control}
                  onChange={() => {
                    handleControlMapSelect('image_is_control')
                  }}
                />
                <TooltipComponent tooltipId="image_is_control">
                  <>
                    Tell Stable Horde that the image you&apos;re uploading is a
                    control map.
                  </>
                </TooltipComponent>
              </FlexRow>
            </div>
          </DropdownOptions>
        )}
        <Button onClick={() => setShowDropdown(true)}>
          <IconSettings stroke={1.5} />
        </Button>
      </FlexRow>
    </div>
  )
}

export default ControlNetOptions
