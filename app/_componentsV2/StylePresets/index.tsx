import { IconArrowBarLeft } from '@tabler/icons-react'
import { GetSetPromptInput } from '_types/artbot'
import Input from 'app/_components/Input'

export default function StylePresets({ input, setInput }: GetSetPromptInput) {
  return (
    <div className="relative">
      <div className="flex flex-row fixed top-4 left-4 right-4">
        <Input />
        <btn>
          <IconArrowBarLeft />
        </btn>
      </div>
    </div>
  )
}
