import React from 'react'
import styles from './optionsRow.module.css'

export default function OptionsRow({
  children,
  style = {}
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className={styles.OptionsRow} style={{ ...style }}>
      {children}
    </div>
  )
}
