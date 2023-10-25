import React, { useId } from 'react'
import styles from './styles.module.css'
import clsx from 'clsx'

interface SwitchProps {
  checked: boolean
  disabled?: boolean
  onChange(): void
}

const Switch = ({ checked, disabled, onChange = () => {} }: SwitchProps) => {
  const id = useId()

  return (
    <>
      <input
        checked={checked}
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
    </>
  )
}

export default Switch
