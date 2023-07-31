'use client'

import { useRouter } from 'next/navigation'
import MenuOptions from '../MenuOptions'
import styles from './fixedMenu.module.css'
import AdContainer from 'components/AdContainer'

export default function FixedMenu() {
  const router = useRouter()

  const navigateToLink = (path: string) => {
    router.push(path)
  }

  return (
    <div className={styles.FixedMenu}>
      <div className={styles.MenuWrapper}>
        <MenuOptions
          navigateToLink={navigateToLink}
          style={{ marginTop: '8px', width: 'var(--fixedSideBar-width)' }}
        />
      </div>
      <div className={styles.SidebarAd}>
        <AdContainer />
      </div>
    </div>
  )
}
