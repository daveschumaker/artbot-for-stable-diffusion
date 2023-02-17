import { useRouter } from 'next/router'

import CreateIcon from '../icons/CreateIcon'
import HourglassIcon from '../icons/HourglassIcon'
import PhotoIcon from '../icons/PhotoIcon'
import SettingsIcon from '../icons/SettingsIcon'
import Link from 'next/link'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../store/appStore'
import StarsIcon from '../icons/StarsIcon'
import styles from './mobileFooter.module.css'
import clsx from 'clsx'

export default function MobileFooter() {
  const router = useRouter()
  const { pathname } = router

  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const isActive = (path = '') => {
    return `${path}` === pathname
  }

  const handleForceReload = () => {
    if ('/images' === pathname) {
      window.location.reload()
    }
  }

  return (
    <div className={styles['footer-wrapper']}>
      <div className={styles['nav-icons-wrapper']}>
        <Link href="/">
          <div
            className={clsx(
              styles['nav-icon'],
              isActive('/') && styles['nav-icon-active']
            )}
          >
            <CreateIcon className={clsx(styles['svg'])} size={32} />
          </div>
        </Link>
        <Link href="/pending">
          <div
            className={clsx(
              styles['nav-icon'],
              isActive('/pending') && styles['nav-icon-active']
            )}
          >
            <HourglassIcon className={clsx(styles['svg'])} size={32} />
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
          <div
            className={clsx(
              styles['nav-icon'],
              isActive('/images') && styles['nav-icon-active']
            )}
          >
            {newImageReady && (
              <span className="opacity-1 inline-block w-3 h-3 mr-1 bg-red-600 rounded-full absolute l-[4px]"></span>
            )}
            <PhotoIcon className={clsx(styles['svg'])} size={32} />
          </div>
        </Link>
        <Link href="/rate">
          <div
            className={clsx(
              styles['nav-icon'],
              isActive('/rate') && styles['nav-icon-active']
            )}
          >
            <StarsIcon className={clsx(styles['svg'])} size={32} />
          </div>
        </Link>
        <Link href="/settings">
          <div
            className={clsx(
              styles['nav-icon'],
              isActive('/settings') && styles['nav-icon-active']
            )}
          >
            <SettingsIcon className={clsx(styles['svg'])} size={32} />
          </div>
        </Link>
      </div>
    </div>
  )
}
