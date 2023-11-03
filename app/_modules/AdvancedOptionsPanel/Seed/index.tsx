import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import Input from 'app/_components/Input'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { IconArrowBarLeft, IconGrain } from '@tabler/icons-react'
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
            setInput({ seed: value })
          }}
        >
          <IconGrain />
        </Button>
        <Button
          theme="secondary"
          title="Clear"
          onClick={() => {
            setInput({ seed: '' })
          }}
        >
          <IconArrowBarLeft />
        </Button>
      </FlexRow>
    </div>
  )
}
