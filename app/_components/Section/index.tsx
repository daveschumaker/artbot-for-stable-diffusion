import React, { CSSProperties } from 'react'
import styles from './section.module.css'
import clsx from 'clsx'

const Section = ({
  children,
  className,
  mt,
  pb,
  style = {}
}: {
  children?: React.ReactNode
  className?: string
  mt?: number
  pb?: number
  style?: CSSProperties
}) => {
  return (
    <div
      className={clsx(styles['section'], className)}
      style={{
        marginTop: mt ? `${mt}px` : 0,
        paddingBottom: pb ? `${pb}px` : 0,
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default Section
