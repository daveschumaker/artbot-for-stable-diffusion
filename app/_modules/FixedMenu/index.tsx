'use client'

import { useRouter } from 'next/navigation'
import MenuOptions from '../MenuOptions'
import styles from './fixedMenu.module.css'
import AdContainer from 'app/_components/AdContainer'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import clsx from 'clsx'
import { useWindowSize } from 'hooks/useWindowSize'

export default function FixedMenu() {
  const { imageDetailsModalOpen } = useStore(appInfoStore)
  const { adHidden } = useStore(appInfoStore)
  const router = useRouter()
  const size = useWindowSize()

  const navigateToLink = (path: string) => {
    router.push(path)
  }

  return (
    <div className={styles.FixedMenu}>
      <div className={clsx(styles.MenuWrapper, adHidden && styles.AdHidden)}>
        <MenuOptions
          forceAdPadding={!adHidden}
          navigateToLink={navigateToLink}
          style={{ marginTop: '8px', width: 'var(--fixedSideBar-width)' }}
        />
      </div>
      {
        // @ts-ignore
        size?.width >= 800 && !imageDetailsModalOpen && (
          <div className={styles.SidebarAd}>
            <AdContainer />
          </div>
        )
      }
    </div>
  )
}
