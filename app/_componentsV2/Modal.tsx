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
      <div className={clsx('modal-box', maxWidth ? maxWidth : 'max-w-5xl')}>
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        {title && <h3 className="font-bold text-lg my-[12px]">{title}</h3>}
        <div className="p-2 font-normal">{content}</div>
        {buttons}
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
