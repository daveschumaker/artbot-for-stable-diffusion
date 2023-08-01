import { CSSProperties, ReactNode } from 'react'
import styles from './pageTitle.module.css'

export default function PageTitle({
  as = 'h1',
  children,
  style
}: {
  as?: string
  children: ReactNode
  style?: CSSProperties
}) {
  const Element = as

  return (
    // @ts-ignore
    <Element className={styles.pageTitle} style={style}>
      {children}
    </Element>
  )
}
