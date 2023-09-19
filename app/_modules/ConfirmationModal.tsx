import { useEffect } from 'react'
import Overlay from 'app/_components/Overlay'
import { Portal } from 'react-portal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'

const ConfirmationModal = ({
  onConfirmClick = () => {},
  closeModal = () => {},
  multiImage = false
}) => {
  const modal = useModal()

  useEffect(() => {
    // @ts-ignore
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        closeModal()
        modal.remove()
      }

      if (e.keyCode === 13) {
        onConfirmClick()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Portal>
      <Overlay handleClose={closeModal} zIndex={100} />
      <div
        className="relative opacity-100 z-[100]"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="left-0 right-0 fixed top-[80px] mx-auto mt-4 w-[320px] md:w-[480px] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-[35]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg font-medium leading-6 text-gray-900"
                  id="modal-title"
                >
                  Delete {multiImage ? 'images' : 'image'}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete{' '}
                    {multiImage ? 'these images' : 'this image'}?
                    <br />
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirmClick}
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                closeModal()
                modal.remove()
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div
        className="inset-0 fixed bg-slate-400 opacity-60"
        onClick={() => {
          closeModal()
          modal.remove()
        }}
      />
    </Portal>
  )
}

export default NiceModal.create(ConfirmationModal)
