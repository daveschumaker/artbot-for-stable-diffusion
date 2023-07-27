import React, { CSSProperties } from 'react'
import styles from './section.module.css'
import clsx from 'clsx'

const Section = ({
  children,
  className,
  style = {}
}: {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}) => {
  return (
    <div className={clsx(styles['section'], className)} style={{ ...style }}>
      {children}
    </div>
  )
}

export default Section
