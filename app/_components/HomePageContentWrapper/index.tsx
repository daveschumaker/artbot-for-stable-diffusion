import { ReactNode } from 'react'
import styles from './homePageContentWrapper.module.css'

const HomePageContentWrapper = ({ children }: { children: ReactNode }) => {
  return <div className={styles.ContentWrapper}>{children}</div>
}

export default HomePageContentWrapper
