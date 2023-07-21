import { ReactNode } from 'react'
import styles from './contentWrapper.module.css'

const ContentWrapper = ({ children }: { children: ReactNode }) => {
  return <div className={styles.ContentWrapper}>{children}</div>
}

export default ContentWrapper
