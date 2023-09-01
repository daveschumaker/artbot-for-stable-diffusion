import { IconMinus, IconPlus, IconPlusMinus } from '@tabler/icons-react'
import clsx from 'clsx'
import Input from 'components/UI/Input'
import styles from './component.module.css'
import { Button } from 'app/_components/Button'
import FlexRow from '../FlexRow'

interface NumberInputProps {
  buttonsAtEnd?: boolean
  disabled?: boolean
  inputMode?: string
  max: number
  min: number
  onBlur?: (e: any) => any
  onChangeStep?: () => any | undefined
  onInputChange: (e: any) => any
  onMinusClick: () => any
  onPlusClick: () => any
  value: number
  width?: string
  step?: number
}

export default function NumberInput(props: NumberInputProps) {
  const { value, max, min } = props
  let { buttonsAtEnd = true } = props
  const {
    onChangeStep,
    onInputChange,
    onMinusClick,
    onPlusClick,
    disabled,
    step,
    width,
    ...rest
  } = props

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
        inputMode={props.inputMode}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        {...rest}
        selectAll
        style={{
          borderColor: 'var(--input-color)',
          borderLeftColor: buttonsAtEnd ? 'var(--input-color)' : '#e1e1e1',
          borderRight: 0,
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
      {onChangeStep && (
        <FlexRow
          gap={4}
          style={{
            justifyContent: 'flex-end',
            paddingLeft: '6px',
            width: 'unset'
          }}
        >
          <IconPlusMinus stroke={1.5} size={18} />
          <Button onClick={onChangeStep}>{step}</Button>
        </FlexRow>
      )}
    </div>
  )
}
