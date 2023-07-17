import { ReactNode } from 'react'
import styles from './contentWrapper.module.css'

// Uses .global-wrapper rule found within globals.css (which other components will reference.)
const ContentWrapper = ({ children }: { children: ReactNode }) => {
  return <div className={styles.ContentWrapper}>{children}</div>
}

export default ContentWrapper
