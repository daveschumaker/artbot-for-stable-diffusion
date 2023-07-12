import { GetSetPromptInput } from 'types/artbot'

import Section from 'components/UI/Section'
import ImageModels from 'models/ImageModels'
import SelectComponent from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
// import { Button } from 'components/UI/Button'
// import { IconFilter } from '@tabler/icons-react'
import { useState } from 'react'
import DropdownOptions from 'components/DropdownOptions'
import styles from './component.module.css'
import FlexRow from 'components/FlexRow'
import { useAvailableModels } from 'hooks/useAvailableModels'

/**
 * TODO:
 * Split out filter models dropdown
 * Dropdown should also have a dynamic height (similar to how modal works).
 */

interface SelectModelProps extends GetSetPromptInput {
  disabled?: boolean
}

const SelectModel = ({ disabled, input, setInput }: SelectModelProps) => {
  const [modelsOptions] = useAvailableModels({ input })
  const [showFilter, setShowFilter] = useState(false)

  return (
    <Section
      style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}
    >
      <SubSectionTitle>
        Model
        {/* <TooltipComponent targetId={`select-models-tooltip`}>
          Models currently available within the horde. Numbers in parentheses
          indicate number of works. Generally, these models will generate images
          quicker.
        </TooltipComponent>
        <TooltipIcon id={`select-models-tooltip`} /> */}
      </SubSectionTitle>
      <FlexRow
        style={{ columnGap: '4px', marginBottom: '8px', position: 'relative' }}
      >
        {showFilter && (
          <DropdownOptions handleClose={() => setShowFilter(false)}>
            <SubSectionTitle>Filter models</SubSectionTitle>
            <ul className={styles.DropdownList}>
              <li>Show all</li>
              <li>Show favorite models</li>
              <li>Show SFW</li>
              <li>Show NSFW</li>
              <li>Show inpainting</li>
            </ul>
          </DropdownOptions>
        )}
        <SelectComponent
          isDisabled={disabled}
          options={modelsOptions}
          onChange={(obj: any) => setInput({ models: [obj.value] })}
          value={ImageModels.dropdownValue(input)}
        />
        {/* <Button onClick={() => setShowFilter(true)}>
          <IconFilter />
        </Button> */}
      </FlexRow>
    </Section>
  )
}

export default SelectModel
