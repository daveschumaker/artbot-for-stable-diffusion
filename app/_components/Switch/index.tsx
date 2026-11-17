import React, { useId } from 'react'
import styles from './styles.module.css'
import clsx from 'clsx'

interface SwitchProps {
  checked: boolean
  disabled?: boolean
  onChange(): void
  labelledBy?: string
  describedBy?: string
  id?: string
}

const Switch = ({
  checked,
  disabled,
  labelledBy,
  describedBy,
  id: suppliedId,
  onChange = () => {}
}: SwitchProps) => {
  const generatedId = useId()
  const id = suppliedId || generatedId

  return (
    <span className={styles.Control}>
      <input
        checked={checked}
        disabled={disabled}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onChange={() => {
          if (disabled) return
          onChange()
        }}
        className={styles['react-switch-checkbox']}
        id={id}
        type="checkbox"
      />
      <label
        className={clsx(
          styles['react-switch-label'],
          checked && styles.Checked,
          disabled && styles.DisabledLabel
        )}
        htmlFor={id}
      >
        <span
          className={clsx(
            styles['react-switch-button'],
            disabled && styles.DisabledButton
          )}
        />
      </label>
    </span>
  )
}

export default Switch
