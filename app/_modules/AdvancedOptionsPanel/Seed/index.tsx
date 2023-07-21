import { Button } from 'components/UI/Button'
import FlexRow from 'app/_components/FlexRow'
import Input from 'components/UI/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { GetSetPromptInput } from 'types/artbot'
import { IconArrowBarLeft, IconGrain } from '@tabler/icons-react'
import AppSettings from 'models/AppSettings'
import PromptInputSettings from 'models/PromptInputSettings'

export default function Seed({ input, setInput }: GetSetPromptInput) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <SubSectionTitle>
        Seed
        <span style={{ fontSize: '12px', fontWeight: '400' }}>
          &nbsp;(optional)
        </span>
      </SubSectionTitle>
      <FlexRow style={{ columnGap: '4px' }}>
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
