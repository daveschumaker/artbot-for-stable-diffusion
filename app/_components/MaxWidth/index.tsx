import { CSSProperties, ReactNode } from 'react'
import styles from './maxWidth.module.css'

const MaxWidth = ({
  children,
  style
}: {
  children: ReactNode
  style?: CSSProperties
}) => {
  return (
    <div className={styles.MaxWidth} style={style}>
      {children}
    </div>
  )
}

export default MaxWidth
