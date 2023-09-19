import { IconX } from '@tabler/icons-react'
import React, { CSSProperties, useEffect, useId } from 'react'
import ClickableOverlay from 'app/_components/ClickableOverlay'
import styles from './modal.module.css'
import useLockedBody from 'app/_hooks/useLockedBody'
import clsx from 'clsx'

interface ModalProps {
  className?: string
  children: React.ReactNode | React.ReactNode[]
  handleClose?: () => any
  hideCloseButton?: boolean
  style?: CSSProperties
  visible?: boolean
}

export default function Modal(props: ModalProps) {
  const [, setLocked] = useLockedBody(false)
  const id = useId()

  const handleClose = () => {
    if (props.handleClose) {
      props.handleClose()
    }
  }

  useEffect(() => {
    if (props.visible) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [props.visible, setLocked])

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'Escape' && props.handleClose) {
        props.handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      setLocked(false)
      window.removeEventListener('keydown', handleKeyPress)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!props.visible) {
    return null
  }

  const modifiedChildren = React.Children.map(props.children, (child: any) => {
    return React.cloneElement(child, { modalId: id })
  })

  return (
    <>
      <ClickableOverlay handleClose={handleClose} />
      <div
        className={clsx(styles.ModalWrapper, props.className)}
        id={id}
        style={props.style}
      >
        {!props.hideCloseButton && (
          <div className={styles.CloseIconWrapper} onClick={props.handleClose}>
            <IconX />
          </div>
        )}
        <div className="mt-[12px]">{modifiedChildren}</div>
      </div>
    </>
  )
}
