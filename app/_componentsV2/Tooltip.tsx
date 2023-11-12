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
      handleClose: handleHideTooltipModal,
      title,
      content: text,
      buttons: (
        <div className="flex flex-row justify-end gap-4">
          <button
            className="btn"
            onClick={() => {
              handleHideTooltipModal()
            }}
          >
            OK
          </button>
        </div>
      )
    })
  }

  return (
    <>
      <div
        className={clsx('cursor-pointer', className)}
        data-tip={text}
        onClick={() => {
          handleShowTooltipModal()
        }}
      >
        <IconInfoCircle size={22} />
      </div>
      {/* {modalOpen && (
        <Modal
          handleClose={() => {
            setModalOpen(false)
          }}
          title={title}
          content={text}
          buttons={
            <div className="flex flex-row justify-end gap-4">
              <button
                className="btn"
                onClick={() => {
                  setModalOpen(false)
                }}
              >
                OK
              </button>
            </div>
          }
        />
      )} */}
    </>
  )
}
