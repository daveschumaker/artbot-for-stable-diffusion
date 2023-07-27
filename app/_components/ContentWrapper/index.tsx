import { CSSProperties, ReactNode } from 'react'
import styles from './contentWrapper.module.css'

const ContentWrapper = ({
  children,
  style
}: {
  children: ReactNode
  style?: CSSProperties
}) => {
  return (
    <div className={styles.ContentWrapper} style={style}>
      {children}
    </div>
  )
}

export default ContentWrapper
