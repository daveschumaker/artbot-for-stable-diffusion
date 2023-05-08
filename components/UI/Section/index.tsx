import React from 'react'
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
  style?: object
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
