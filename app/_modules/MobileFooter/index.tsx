'use client'
import { usePathname } from 'next/navigation'

import Link from 'next/link'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from 'app/_store/appStore'
import styles from './mobileFooter.module.css'
import clsx from 'clsx'
import {
  IconEdit,
  IconHourglass,
  IconPhoto,
  IconSettings,
  IconStars
} from '@tabler/icons-react'

export default function MobileFooter() {
  const pathname = usePathname()

  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const isActive = (path = '') => {
    return path === pathname
  }

  const handleForceReload = () => {
    if ('/images' === pathname) {
      window.location.reload()
    }
  }

  return (
    <div className={styles['footer-wrapper']}>
      <div className={styles['nav-icons-wrapper']}>
        <Link href="/create">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/create') && <div className={styles.NavIconActive} />}
            <IconEdit className={clsx(styles['svg'])} size={32} stroke={1} />
          </div>
        </Link>
        <Link href="/pending">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/pending') && <div className={styles.NavIconActive} />}
            <IconHourglass
              className={clsx(styles['svg'])}
              size={32}
              stroke={1}
            />
          </div>
        </Link>
        <Link
          href="/images"
          className="relative"
          onClick={() => {
            handleForceReload()
            setShowImageReadyToast(false)
            setNewImageReady('')
          }}
        >
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/images') && <div className={styles.NavIconActive} />}
            {newImageReady && (
              <span
                className="opacity-1 inline-block w-3 h-3 mr-1 bg-red-600 rounded-full"
                style={{ position: 'absolute', top: '20px', left: '2px' }}
              ></span>
            )}
            <IconPhoto className={clsx(styles['svg'])} size={32} stroke={1} />
          </div>
        </Link>
        <Link href="/rate">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/rate') && <div className={styles.NavIconActive} />}
            <IconStars className={clsx(styles['svg'])} size={32} stroke={1} />
          </div>
        </Link>
        <Link href="/settings">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/settings') && <div className={styles.NavIconActive} />}
            <IconSettings
              className={clsx(styles['svg'])}
              size={32}
              stroke={1}
            />
          </div>
        </Link>
      </div>
    </div>
  )
}
