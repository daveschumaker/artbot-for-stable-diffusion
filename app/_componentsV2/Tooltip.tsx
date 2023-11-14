'use client'

import React from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import NiceModal from '@ebay/nice-modal-react'
import clsx from 'clsx'

interface TooltipProps {
  className?: string
  title: React.ReactNode | string
  text: React.ReactNode | string
}

export function Tooltip({ className, title, text }: TooltipProps) {
  const handleHideTooltipModal = () => {
    NiceModal.remove('tooltip-modal')
  }

  const handleShowTooltipModal = () => {
    NiceModal.show('tooltip-modal', {
      buttons: (
        <div className="flex flex-row justify-end gap-4">
          <button
            className="btn btn-outline"
            onClick={() => {
              handleHideTooltipModal()
            }}
          >
            OK
          </button>
        </div>
      ),
      content: text,
      handleClose: handleHideTooltipModal,
      maxWidth: 'max-w-2xl',
      title
    })
  }

  return (
    <>
      <div
        className={clsx('text-secondary cursor-pointer', className)}
        data-tip={text}
        onClick={() => {
          handleShowTooltipModal()
        }}
      >
        <IconInfoCircle size={20} stroke={1.5} />
      </div>
    </>
  )
}
