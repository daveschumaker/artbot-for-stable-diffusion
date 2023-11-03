import React, { useEffect } from 'react'
import Overlay from 'app/_components/Overlay'
import { IconHelpCircle } from '@tabler/icons-react'

interface IProps {
  children: React.ReactNode
  deleteButtonText?: string
  onConfirmClick: () => void
  closeModal: () => void
}

const HelpfulTipModal = ({
  children = null,
  closeModal = () => {}
}: IProps) => {
  useEffect(() => {
    // @ts-ignore
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Overlay handleClose={closeModal} />
      <div
        className="z-30 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="border-[1px] border-[#a1a1a1] mx-auto mt-4 w-[320px] md:w-[480px] relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                style={{ backgroundColor: '#6ab7c6' }}
              >
                <IconHelpCircle stroke={1} color="white" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                {children}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={closeModal}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HelpfulTipModal
