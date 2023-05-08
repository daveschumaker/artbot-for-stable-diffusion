import * as React from 'react'
import clsx from 'clsx'
import { IconArrowBarLeft } from '@tabler/icons-react'
import isMobile from 'is-mobile'

import TooltipComponent from '../../components/Tooltip'
import TextArea from 'components/UI/TextArea'
import { Button } from 'components/UI/Button'

interface Props {
  handleChangeValue: (e: any) => void
  handleClear: () => void
  label: React.ReactNode
  optionalButton?: React.ReactNode
  placeholder: string
  value: string
}

const BasePromptTextArea = ({
  handleChangeValue,
  handleClear,
  label,
  optionalButton,
  placeholder,
  value
}: Props) => {
  const flexRowClasses = ['align-start', 'w-full', 'flex', 'flex-row', 'gap-2']

  return (
    <div className="mb-2">
      <div className="flex flex-row items-center gap-2 mt-0 mb-1 text-sm font-bold text-white">
        {label}
      </div>
      <div className={clsx(flexRowClasses)}>
        <TextArea
          name="prompt"
          placeholder={placeholder}
          onChange={handleChangeValue}
          value={value}
        />
        <div className="flex flex-col gap-2">
          <TooltipComponent disabled={isMobile()} targetId="promptText-tooltip">
            Clear input text
          </TooltipComponent>
          <Button
            id="promptText-tooltip"
            title="Clear current input"
            theme="secondary"
            onClick={handleClear}
            size="small"
          >
            <IconArrowBarLeft stroke={1.5} />
          </Button>
          {optionalButton}
        </div>
      </div>
    </div>
  )
}

export default BasePromptTextArea
