import { toast } from 'react-toastify'

export const showSuccessToast = ({ message }: { message: string }) => {
  if (!message) return

  toast.success(message, {
    pauseOnFocusLoss: false,
    position: 'top-center',
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'light'
  })
}

export const showErrorToast = ({ message }: { message: string }) => {
  if (!message) return

  toast.error(message, {
    pauseOnFocusLoss: false,
    position: 'top-center',
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'light'
  })
}
