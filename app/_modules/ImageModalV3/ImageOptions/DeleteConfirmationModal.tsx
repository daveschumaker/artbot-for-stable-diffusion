import NiceModal from '@ebay/nice-modal-react'

export const DeleteContent = () => {
  return (
    <div className="">
      <div className="flex flex-row gap-2 items-center justify-start">
        <div className="flex h-8 w-8 justify-center items-center rounded-full bg-red-100">
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
        <h3 className="text-lg font-medium" id="modal-title">
          Delete image?
        </h3>
      </div>
      <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
        <div className="mt-2">
          <p className="text-sm">
            Are you sure you want to delete this image?
            <br />
            <p className="pt-2">
              <strong>This action cannot be undone.</strong>
            </p>
          </p>
        </div>
      </div>
    </div>
  )
}

export const DeleteButtons = ({
  onConfirmClick = () => {}
}: {
  onConfirmClick: () => void
}) => {
  return (
    <div className="flex flex-row justify-end gap-2">
      <div className="flex flex-row justify-end gap-4">
        <button
          className="btn btn-secondary btn-outline"
          onClick={() => {
            NiceModal.remove('confirmation-modal')
          }}
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-row justify-end gap-4">
        <button
          className="btn btn-error"
          onClick={async () => {
            await onConfirmClick()
            NiceModal.remove('confirmation-modal')
          }}
        >
          DELETE
        </button>
      </div>
    </div>
  )
}
