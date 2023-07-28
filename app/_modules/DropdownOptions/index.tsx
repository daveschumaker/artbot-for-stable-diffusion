import { IconX } from '@tabler/icons-react'
import React, { ReactNode, useEffect, useState } from 'react'
import ClickableOverlay from 'app/_components/ClickableOverlay'
import styles from './dropdownOptions.module.css'

const FIXED_HEIGHT = 480

export default function DropdownOptions({
  children,
  handleClose,
  height,
  title,
  top = '42px',
  maxWidth = '100%'
}: {
  children: ReactNode
  handleClose: () => void
  height?: number
  title?: string
  top?: string
  maxWidth?: string
}) {
  const [childSize, setChildSize] = useState({ height: FIXED_HEIGHT, width: 0 })

  const handleChildSizeChange = (size: { height: number; width: number }) => {
    setChildSize(size)
  }

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
      <div
        className={styles['DropdownOptions']}
        style={{
          maxHeight:
            childSize.height < FIXED_HEIGHT
              ? childSize.height + 56
              : FIXED_HEIGHT,
          maxWidth,
          top
        }}
      >
        {title && <div className={styles.Title}>{title}</div>}
        <div className={styles['CloseButton']} onClick={handleClose}>
          <IconX stroke={1.5} />
        </div>
        <div
          className={styles.DropdownContent}
          style={{ height: height ? `${height}px` : 'auto' }}
        >
          {React.Children.map(children, (child, index) => {
            if (index === 0 && React.isValidElement(child)) {
              return React.cloneElement(child, {
                // @ts-ignore
                handleChildSizeChange
              })
            }
            return child
          })}
        </div>
      </div>
    </>
  )
}
