import React, { CSSProperties } from 'react'
import styles from './section.module.css'
import clsx from 'clsx'

const Section = ({
  first = false,
  children,
  className,
  style = {}
}: {
  first?: boolean
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}) => {
  return (
    <div
      className={clsx(
        {
          [styles['section']]: !first,
          [styles['section-first']]: first
        },
        className
      )}
      style={{ ...style }}
    >
      {children}
    </div>
  )
}

export default Section
