import { ReactNode } from 'react'
import styles from './flexibleRow.module.css'

export default function FlexibleRow({
  children,
  style
}: {
  children: ReactNode
  style?: { [key: string]: number | string }
}) {
  return (
    <div className={styles.flexibleRow} style={style}>
      {children}
    </div>
  )
}
