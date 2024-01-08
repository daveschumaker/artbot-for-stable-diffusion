import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import Input from 'app/_components/Input'
import { IconArrowBarLeft, IconGrain } from '@tabler/icons-react'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './seed.module.css'

export default function Seed() {
  const { input, setInput } = useInput()

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        columnGap: '8px',
        width: '100%'
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          columnGap: '2px',
          fontWeight: 700,
          fontSize: '14px',
          minWidth: 'var(--options-label-width)',
          width: 'var(--options-label-width)'
        }}
      >
        Seed
      </div>
      <FlexRow gap={4}>
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
    </div>
  )
}
