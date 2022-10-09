import { useEffect, useState } from 'react'

import Toast from '../components/Toast'
import { getCurrentJob, setHasNewImage } from '../utils/imageCache'

const PollController = () => {
  const [showToast, setShowToast] = useState(false)

  const showToastTimeout = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const jobDetails = await getCurrentJob()

      if (jobDetails?.newImage) {
        showToastTimeout()
        setHasNewImage(true)
      }
    }, 10000)

    return () => clearInterval(interval)
  })

  return <>{showToast && <Toast handleClose={handleCloseToast} />}</>
}

export default PollController
