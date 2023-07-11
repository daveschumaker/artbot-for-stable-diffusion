import { IconX } from '@tabler/icons-react'
import { ReactNode, useEffect } from 'react'
import ClickableOverlay from '../ClickableOverlay'
import styles from './dropdownOptions.module.css'

export default function DropdownOptions({
  children,
  handleClose,
  height
}: {
  children: ReactNode
  handleClose: () => void
  height?: number
}) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ClickableOverlay disableBackground handleClose={handleClose} />
      <div className={styles['DropdownOptions']}>
        <div className={styles['CloseButton']} onClick={handleClose}>
          <IconX stroke={1.5} />
        </div>
        <div
          className={styles.DropdownContent}
          style={{ height: height ? `${height}px` : 'auto' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
