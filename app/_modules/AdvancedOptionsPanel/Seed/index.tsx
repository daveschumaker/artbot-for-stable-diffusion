import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import Input from 'app/_components/Input'
import { IconArrowBarLeft, IconGrain } from '@tabler/icons-react'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './seed.module.css'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'

export default function Seed() {
  const { input, setInput } = useInput()

  return (
    <OptionsRow>
      <OptionsRowLabel>Seed</OptionsRowLabel>
      <FlexRow gap={8}>
        <Input
          placeholder="Optional"
          onChange={(e: any) => setInput({ seed: e.target.value })}
          value={input.seed}
        />
        <Button
          className={styles['seed-btn']}
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
          className={styles['seed-btn']}
          theme="secondary"
          title="Clear"
          onClick={() => {
            setInput({ seed: '' })
          }}
        >
          <IconArrowBarLeft />
        </Button>
      </FlexRow>
    </OptionsRow>
  )
}
