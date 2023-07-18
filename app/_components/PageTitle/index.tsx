import { ReactNode } from 'react'
import styles from './pageTitle.module.css'

export default function PageTitle({
  as = 'h1',
  children
}: {
  as?: string
  children: ReactNode
}) {
  const Element = as

  // @ts-ignore
  return <Element className={styles.pageTitle}>{children}</Element>
}
