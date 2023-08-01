'use client'

import { useRouter } from 'next/navigation'
import MenuOptions from '../MenuOptions'
import styles from './fixedMenu.module.css'
import AdContainer from 'components/AdContainer'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import clsx from 'clsx'

export default function FixedMenu() {
  const { adHidden } = useStore(appInfoStore)
  const router = useRouter()

  const navigateToLink = (path: string) => {
    router.push(path)
  }

  return (
    <div className={styles.FixedMenu}>
      <div className={clsx(styles.MenuWrapper, adHidden && styles.AdHidden)}>
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
