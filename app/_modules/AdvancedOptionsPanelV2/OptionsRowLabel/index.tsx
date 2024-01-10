import React from 'react'
import styles from './optionsRowLabel.module.css'

export default function OptionsRowLabel({
  children,
  style = {}
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className={styles.OptionsRowLabel} style={{ ...style }}>
      {children}
    </div>
  )
}
