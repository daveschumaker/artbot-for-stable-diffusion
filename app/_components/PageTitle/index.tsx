import { CSSProperties, ReactNode } from 'react'
import styles from './pageTitle.module.css'

export default function PageTitle({
  as = 'h1',
  children,
  style
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  children: ReactNode
  style?: CSSProperties
}) {
  const Element = as

  return (
    <Element className={styles.pageTitle} style={style}>
      {children}
    </Element>
  )
}
