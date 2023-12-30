import clsx from 'clsx'
import * as React from 'react'

import styles from './button.module.css'

interface ButtonProps {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  id?: string
  onClick?: () => void
  size?: string
  theme?: string
  title?: string
  width?: string
  style?: object
}

export function Button(props: ButtonProps) {
  const {
    children,
    id,
    className,
    disabled = false,
    onClick = () => {},
    size,
    theme,
    style = {},
    width,
    ...rest
  } = props

  const s = { ...style, touchAction: 'manipulation' }

  if (width) {
    // @ts-ignore
    s.width = width
  }

  return (
    <button
      id={id}
      disabled={disabled}
      className={clsx(styles['styled-button'], className, {
        [styles['styled-button-secondary']]: theme === 'secondary',
        [styles['styled-button-small']]: size === 'small',
        [styles['styled-button-square']]: size === 'square',
        [styles['styled-button-square-small']]: size === 'square-small',
        [styles['styled-button-disabled']]: disabled
      })}
      onClick={(e) => {
        if (e) e.preventDefault()
        if (disabled) return
        onClick()
      }}
      style={{ ...s }}
      {...rest}
    >
      {children}
    </button>
  )
}
