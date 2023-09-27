/**
 * I'm tired of all the different modal implementations around this web app.
 * This will be the final, one true modal to use everywhere.
 *
 * Hopefully...
 */

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Overlay from 'app/_components/Overlay'
import React, { useEffect, useRef, useState } from 'react'
import styles from './awesomeModal.module.css'
import { IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import TooltipComponent from 'app/_components/TooltipComponent'
import { useContentHeight } from './awesomeModalProvider'
import useLockedBody from 'app/_hooks/useLockedBody'

interface Props {
  children?: React.ReactNode
  className?: string
  disableBackground?: boolean
  handleClose?(): any
  label?: string
  subtitle?: string
  tooltip?: string
}

function AwesomeModal({
  children,
  className,
  disableBackground = false,
  handleClose = () => {},
  label,
  subtitle,
  tooltip
}: Props) {
  const modalRef = useRef()

  const modal = useModal()
  const [locked, setLocked] = useLockedBody(false)
  let { maxModalHeight } = useContentHeight()
  const [minHeight, setMinHeight] = useState(180)

  const onClose = () => {
    modal.remove()
    handleClose()
  }

  // Handle lock body
  useEffect(() => {
    if (modal.visible && !locked) {
      setLocked(true)
    }
  }, [locked, modal.visible, setLocked])

  // Listen for keypress
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      setLocked(false)
      window.removeEventListener('keydown', handleKeyPress)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const modalNode = modalRef.current
    if (modalNode) {
      const observer = new MutationObserver(() => {
        const computedStyle = getComputedStyle(modalNode)
        console.log('height:', computedStyle.height)
        console.log('Top:', computedStyle.top)
        console.log('bottom:', computedStyle.bottom)

        const [modalHeightStr] = computedStyle.height.split('px')
        const modalHeight = Number(modalHeightStr)

        if (modalHeight > minHeight) {
          setMinHeight(modalHeight)
        }
      })

      observer.observe(modalNode, {
        attributes: true,
        childList: true,
        subtree: true
      })

      return () => observer.disconnect()
    }
  }, [minHeight])

  return (
    <>
      <Overlay
        blurBackground
        disableBackground={disableBackground}
        handleClose={onClose}
      />
      <div
        className={clsx(styles.ModalWrapper, className)}
        style={{
          maxHeight: `${maxModalHeight}px`,
          minHeight: `${minHeight}px`,
          paddingTop: !label ? '38px' : 0
        }}
        ref={modalRef}
      >
        <div className={styles.CloseButton} onClick={onClose}>
          <IconX stroke={1.5} size={28} />
        </div>
        {label && (
          <div className={styles.ModalLabel}>
            {label}
            {tooltip && (
              <TooltipComponent tooltipId="sdxl-beta-tooltip-modal">
                {tooltip}
              </TooltipComponent>
            )}
          </div>
        )}
        {subtitle && <div className={styles.ModalSubtitle}>{subtitle}</div>}
        <div
          className={clsx(
            styles.ModalContentV2,
            subtitle && styles.ModalContentSubtitleOffset
          )}
          id="modal_content"
          style={{
            overflowY: 'auto',
            // @ts-ignore
            maxHeight: !label ? maxModalHeight - 38 : maxModalHeight - 56
          }}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                // @ts-ignore
                handleClose: onClose,
                // @ts-ignore
                modalHeight: maxModalHeight - 72,
                style: {
                  paddingBottom: !label ? '38px' : 0
                  //   overflowY: 'auto',
                  //   flex: 1
                }
              })
            }
            return child
          })}
        </div>
      </div>
    </>
  )
}

export default NiceModal.create(AwesomeModal)
