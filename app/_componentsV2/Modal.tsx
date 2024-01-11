import NiceModal, { useModal } from '@ebay/nice-modal-react'
import clsx from 'clsx'
import React, { useCallback, useEffect, useId, useRef } from 'react'

interface ModalProps {
  buttons?: React.ReactNode | null
  children: React.ReactNode
  content?: React.ReactNode | string
  fixedContent?: React.ReactNode
  handleClose?: () => void
  id?: string
  maxWidth?: string
  title?: React.ReactNode | string
}

function Modal({
  buttons = null,
  children,
  content,
  fixedContent,
  handleClose = () => {},
  id,
  maxWidth,
  title
}: ModalProps) {
  const modal = useModal()
  const modalId = useId()
  const modalRef = useRef<HTMLDialogElement>(null)

  const onClose = useCallback(() => {
    modal.remove()
    handleClose()
  }, [handleClose, modal])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalRef.current?.contains(e.target as Node)) {
          e.stopPropagation()
          e.preventDefault()
          onClose()
        }
      }
    }
    window?.addEventListener('keydown', handleKeyPress)
    return () => {
      window?.removeEventListener('keydown', handleKeyPress)
    }
  }, [onClose])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  let fixedHeightOffset = 24

  if (title) {
    fixedHeightOffset += 24
  }

  let contentOffset = fixedHeightOffset

  if (fixedContent) {
    contentOffset += 44
  }

  return (
    <dialog
      className="modal modal-open text-left"
      id={id || modalId}
      ref={modalRef}
      tabIndex={-1}
    >
      <div
        className={clsx('modal-box p-0', maxWidth ? maxWidth : 'max-w-5xl')}
        style={{ backgroundColor: 'var(--body-color)' }}
      >
        <div
          className="sticky bg-inherit"
          style={{
            top: 0,
            zIndex: 1
          }}
        >
          <button
            className="btn btn-sm btn-circle btn-ghost absolute"
            onClick={onClose}
            style={{ right: '16px', top: '16px', zIndex: 1 }}
          >
            ✕
          </button>
          {title && (
            <h6
              className="font-bold bg-inherit text-[14px] absolute"
              style={{
                padding: '24px 24px 8px 24px',
                top: '0px',
                left: 0,
                right: 0
              }}
            >
              {title}
            </h6>
          )}
          {fixedContent && (
            <div
              className="bg-inherit"
              style={{
                left: 0,
                right: 0,
                padding: '0 24px 8px 24px',
                position: 'absolute',
                top: `${fixedHeightOffset}px`
              }}
            >
              {fixedContent}
            </div>
          )}
        </div>
        <div
          className={clsx('font-normal relative')}
          style={{
            padding: `${contentOffset + 12}px 24px 24px 24px`
          }}
        >
          {content || children}
        </div>
        {buttons && <div className="p-[24px]">{buttons}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClose()
          }}
        >
          close
        </button>
      </form>
    </dialog>
  )
}

export default NiceModal.create(Modal)
