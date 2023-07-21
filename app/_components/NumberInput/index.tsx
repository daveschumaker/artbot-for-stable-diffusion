import { IconMinus, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import Input from 'components/UI/Input'
import styles from './component.module.css'
import { Button } from 'components/UI/Button'

interface NumberInputProps {
  buttonsAtEnd?: boolean
  value: number
  min: number
  max: number
  onInputChange: (e: any) => any
  onMinusClick: () => any
  onPlusClick: () => any
  disabled?: boolean
  width?: string
}

export default function NumberInput(props: NumberInputProps) {
  const { value, max, min } = props
  let { buttonsAtEnd = true } = props
  const { onInputChange, onMinusClick, onPlusClick, disabled, width, ...rest } =
    props

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
    <div
      className={styles['number-input-wrapper']}
      style={{ width: width ? width : '160px' }}
    >
      {!buttonsAtEnd && (
        <Button
          className={clsx(styles['number-input-minus-btn'])}
          disabled={Number(value) <= min || disabled}
          onClick={handleMinusClick}
        >
          <IconMinus stroke={1.5} />
        </Button>
      )}
      <Input
        disabled={disabled}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        {...rest}
        selectAll
        style={{
          borderColor: 'var(--input-color)',
          borderLeftColor: buttonsAtEnd ? 'var(--input-color)' : '#e1e1e1',
          borderRightColor: '#e1e1e1',
          borderRadius: 0,
          borderTopLeftRadius: buttonsAtEnd ? '4px' : 0,
          borderBottomLeftRadius: buttonsAtEnd ? '4px' : 0,
          textAlign: 'center'
        }}
        value={value as unknown as string}
      />
      {buttonsAtEnd && (
        <Button
          className={clsx(
            styles['number-input-minus-btn'],
            styles.ButtonsOnEnd
          )}
          disabled={Number(value) <= min || disabled}
          onClick={handleMinusClick}
        >
          <IconMinus stroke={1.5} />
        </Button>
      )}
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
