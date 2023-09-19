import React from 'react'
import clsx from 'clsx'
import styles from './input.module.css'

interface InputProps {
  autoFocus?: boolean
  name?: string
  type?: string
  disabled?: boolean
  className?: string
  id?: string
  inputMode?: any
  children?: React.ReactNode
  error?: boolean | string
  step?: number
  min?: number
  max?: number
  onBlur?: any
  onChange: any
  placeholder?: string
  selectAll?: boolean
  style?: any
  tabIndex?: number
  width?: string
  value: string
  onKeyDown?: (e: any) => any
}

const Input = (props: InputProps) => {
  const {
    children,
    className,
    id,
    selectAll = false,
    style = {},
    value = '',
    ...rest
  } = props

  const handleFocus = (e: any) => {
    e.target.select()
  }

  return (
    <input
      id={id}
      className={clsx(
        styles['styled-input'],
        props.error && styles['error'],
        className
      )}
      onFocus={(e) => {
        if (selectAll) {
          handleFocus(e)
        }
      }}
      style={style}
      value={value}
      {...rest}
    >
      {children}
    </input>
  )
}

export default Input
