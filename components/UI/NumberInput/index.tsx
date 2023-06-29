import { IconMinus, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import { Button } from '../Button'
import Input from '../Input'
import styles from './component.module.css'

export default function NumberInput(props: any) {
  const { value, max, min } = props
  const { onInputChange, onMinusClick, onPlusClick, disabled, ...rest } = props

  const handleMinusClick = () => {
    if (Number(value) <= min || disabled) {
      return
    }

    onMinusClick()
  }

  const handlePlusClick = () => {
    if (Number(value || disabled) >= max) {
      return
    }

    onPlusClick()
  }

  const handleKeyDown = (e: any) => {
    e = e || window.event

    if (disabled) {
      return
    }

    if (e.code === 'ArrowUp' || e.code === 'Equal' || e.code === 'NumpadAdd') {
      e.preventDefault()
      handlePlusClick()
    }

    if (
      e.code === 'ArrowDown' ||
      e.code === 'Minus' ||
      e.code === 'NumpadSubtract'
    ) {
      e.preventDefault()
      handleMinusClick()
    }
  }

  return (
    <div className={styles['number-input-wrapper']}>
      <Button
        className={clsx(styles['number-input-minus-btn'])}
        disabled={Number(value) <= min || disabled}
        onClick={handleMinusClick}
      >
        <IconMinus stroke={1.5} />
      </Button>
      <Input
        disabled={disabled}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        {...rest}
        selectAll
        style={{
          borderColor: 'var(--input-color)',
          borderLeftColor: '#e1e1e1',
          borderRightColor: '#e1e1e1',
          borderRadius: 0,
          textAlign: 'center'
        }}
        value={value}
      />
      <Button
        className={clsx(styles['number-input-plus-btn'])}
        disabled={Number(value || disabled) >= max}
        onClick={handlePlusClick}
      >
        <IconPlus stroke={1.5} />
      </Button>
    </div>
  )
}
