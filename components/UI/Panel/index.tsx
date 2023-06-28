import React from 'react'
import styles from './component.module.css'

interface PanelProps {
  children?: React.ReactNode
  className?: string
  open?: boolean
  padding?: string
}

const Panel = (props: PanelProps) => {
  const { children, ...rest } = props
  return (
    <div className={styles.Panel} {...rest}>
      {children}
    </div>
  )
}

export default Panel
