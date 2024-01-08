'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from 'statery'
import useLockedBody from 'app/_hooks/useLockedBody'
import { appInfoStore, setShowAppMenu } from 'app/_store/appStore'
import Overlay from 'app/_components/Overlay'
import { IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import MenuOptions from '../MenuOptions'
import styles from './slidingMenu.module.css'

const SlidingMenu = () => {
  const [, setLocked] = useLockedBody(false)
  const router = useRouter()
  const appState = useStore(appInfoStore)
  const { showAppMenu = false } = appState

  const handleClose = () => {
    setShowAppMenu(false)
  }

  const navigateToLink = (path: string) => {
    handleClose()
    router.push(path)
  }

  useEffect(() => {
    if (showAppMenu) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [setLocked, showAppMenu])

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      setLocked(false)
      window.removeEventListener('keydown', handleKeyPress)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {showAppMenu && <Overlay handleClose={handleClose} />}
      <div
        className={clsx(
          styles.MenuOverlay,
          showAppMenu && styles.MenuOverlayShow
        )}
      >
        <div className={styles.CloseWrapper} onClick={handleClose}>
          <IconX size={32} stroke={1.5} />
        </div>
        <div style={{ marginTop: '64px' }}>
          <MenuOptions navigateToLink={navigateToLink} />
        </div>
      </div>
    </>
  )
}

export default SlidingMenu
