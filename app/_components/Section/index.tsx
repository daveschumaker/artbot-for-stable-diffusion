import React, { CSSProperties } from 'react'
import styles from './section.module.css'
import clsx from 'clsx'

const Section = ({
  children,
  className,
  style = {},
  pb
}: {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
  pb?: number
}) => {
  return (
    <div
      className={clsx(styles['section'], className)}
      style={{ paddingBottom: pb ? `${pb}px` : 0, ...style }}
    >
      {children}
    </div>
  )
}

export default Section
