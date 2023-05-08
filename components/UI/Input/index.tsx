import React from 'react'
import clsx from 'clsx'
import styles from './input.module.css'

interface InputProps {
  autoFocus?: boolean
  name?: string
  type?: string
  className?: string
  id?: string
  children?: React.ReactNode
  error?: boolean | string
  step?: number
  min?: number
  max?: number
  onBlur?: any
  onChange: any
  placeholder?: string
  selectAll?: boolean
  tabIndex?: number
  width?: string
  value: string
}

const Input = (props: InputProps) => {
  const {
    children,
    className,
    id,
    selectAll = false,
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
      width={props.width || '100%'}
      value={value}
      {...rest}
    >
      {children}
    </input>
  )
}

export default Input
