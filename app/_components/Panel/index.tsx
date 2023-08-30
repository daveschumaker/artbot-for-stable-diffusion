import React, { CSSProperties } from 'react'
import styles from './component.module.css'

interface PanelProps {
  children?: React.ReactNode
  className?: string
  open?: boolean
  style?: CSSProperties
  padding?: string
}

const Panel = (props: PanelProps) => {
  const { children, style, ...rest } = props
  return (
    <div className={styles.Panel} style={style} {...rest}>
      {children}
    </div>
  )
}

export default Panel
