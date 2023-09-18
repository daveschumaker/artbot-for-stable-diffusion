import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { IconCheck } from '@tabler/icons-react'
import { useId } from 'react'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (bool: boolean) => any
}

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
  const id = useId()

  return (
    <div className="flex items-center">
      <RadixCheckbox.Root
        className="flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] outline-none"
        checked={checked}
        id={id}
        onCheckedChange={onChange}
        style={{
          backgroundColor: 'rgb(1, 171, 171)',
          height: '25px',
          width: '25px',
          minWidth: '25px'
        }}
      >
        <RadixCheckbox.Indicator className="text-white">
          <IconCheck />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label className="pl-[8px] text-[15px] leading-none" htmlFor={id}>
        {label}
      </label>
    </div>
  )
}
