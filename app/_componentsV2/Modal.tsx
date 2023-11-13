import NiceModal, { useModal } from '@ebay/nice-modal-react'
import clsx from 'clsx'
import React, { useCallback, useEffect, useId, useRef } from 'react'

interface ModalProps {
  buttons?: React.ReactNode | null
  content: React.ReactNode | string
  handleClose?: () => void
  maxWidth?: string
  title?: React.ReactNode | string
}

function Modal({
  buttons = null,
  content,
  handleClose = () => {},
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

  return (
    <dialog
      className="modal modal-open text-left"
      id={modalId}
      ref={modalRef}
      tabIndex={-1}
    >
      <div className={clsx('modal-box p-0', maxWidth ? maxWidth : 'max-w-5xl')}>
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
            <h3
              className="font-bold bg-inherit text-lg absolute"
              style={{
                padding: '30px 24px 8px 24px',
                top: '0px',
                left: 0,
                right: 0
              }}
            >
              {title}
            </h3>
          )}
        </div>
        <div
          className={clsx(
            'p-[24px] font-normal relative',
            title ? 'pt-[66px]' : 'pt-[24px]'
          )}
        >
          {content}
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
