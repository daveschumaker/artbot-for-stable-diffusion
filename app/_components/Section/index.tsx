import React, { CSSProperties } from 'react'
import styles from './section.module.css'
import clsx from 'clsx'

const Section = ({
  children,
  className,
  mb,
  mt,
  pb,
  style = {}
}: {
  children?: React.ReactNode
  className?: string
  mb?: number
  mt?: number
  pb?: number
  style?: CSSProperties
}) => {
  return (
    <div
      className={clsx(styles['section'], className)}
      style={{
        marginBottom: mb ? `${mb}px` : 0,
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
