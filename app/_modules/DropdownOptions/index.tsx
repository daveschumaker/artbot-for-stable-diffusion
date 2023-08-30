import { IconX } from '@tabler/icons-react'
import React, { CSSProperties, ReactNode, useEffect, useState } from 'react'
import ClickableOverlay from 'app/_components/ClickableOverlay'
import styles from './dropdownOptions.module.css'
import clsx from 'clsx'

const FIXED_HEIGHT = 480

export default function DropdownOptions({
  autoSize = false,
  children,
  className,
  handleClose,
  height,
  title,
  top = '42px',
  maxWidth = '100%',
  style
}: {
  autoSize?: boolean
  children: ReactNode
  className?: string
  handleClose: () => void
  height?: number
  title?: string
  top?: string
  maxWidth?: string
  style?: CSSProperties
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
        className={clsx(styles['DropdownOptions'], className)}
        style={{
          maxHeight:
            childSize.height < FIXED_HEIGHT
              ? childSize.height + 56
              : FIXED_HEIGHT,
          maxWidth,
          top,
          ...style
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
              if (autoSize) {
                return React.cloneElement(child as any, {
                  handleChildSizeChange
                })
              }
            }
            return child
          })}
        </div>
      </div>
    </>
  )
}
