import { ReactNode } from 'react'
import styles from './pageTitle.module.css'

export default function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={styles.pageTitle}>{children}</h1>
}
