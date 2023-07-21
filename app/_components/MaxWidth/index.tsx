import { ReactNode } from 'react'
import styles from './maxWidth.module.css'

const MaxWidth = ({ children }: { children: ReactNode }) => {
  return <div className={styles.MaxWidth}>{children}</div>
}

export default MaxWidth
