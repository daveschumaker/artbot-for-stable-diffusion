import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import Input from 'app/_components/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { IconArrowBarLeft, IconGrain } from '@tabler/icons-react'
import AppSettings from 'app/_data-models/AppSettings'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { useInput } from 'app/_modules/InputProvider/context'

export default function Seed() {
  const { input, setInput } = useInput()

  return (
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>
        Seed
        <span style={{ fontSize: '12px', fontWeight: '400' }}>
          &nbsp;(optional)
        </span>
      </SubSectionTitle>
      <FlexRow gap={4}>
        <Input
          onChange={(e: any) => setInput({ seed: e.target.value })}
          value={input.seed}
        />
        <Button
          title="Insert random seed"
          onClick={() => {
            const value = Math.abs(
              (Math.random() * 2 ** 32) | 0
            ) as unknown as string
            if (AppSettings.get('saveSeedOnCreate')) {
              PromptInputSettings.set('seed', value)
            }
            setInput({ seed: value })
          }}
        >
          <IconGrain />
        </Button>
        <Button
          theme="secondary"
          title="Clear"
          onClick={() => {
            PromptInputSettings.set('seed', '')
            setInput({ seed: '' })
          }}
        >
          <IconArrowBarLeft />
        </Button>
      </FlexRow>
    </div>
  )
}
