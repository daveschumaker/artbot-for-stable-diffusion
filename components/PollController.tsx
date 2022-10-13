import { useEffect, useState } from 'react'
import { useStore } from 'statery'

import Toast from '../components/Toast'
import { appInfoStore, setNewImageReady } from '../store/appStore'
import { getCurrentJob } from '../utils/imageCache'

const PollController = () => {
  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const [showToast, setShowToast] = useState(false)

  const handleCloseToast = () => {
    setShowToast(false)
  }

  useEffect(() => {
    if (newImageReady === false) {
      setShowToast(false)
    } else if (newImageReady === true) {
      setShowToast(true)
    }
  }, [newImageReady])

  useEffect(() => {
    const interval = setInterval(async () => {
      const jobDetails = await getCurrentJob()

      if (jobDetails?.newImage) {
        setNewImageReady(true)
        setShowToast(true)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return <>{showToast && <Toast handleClose={handleCloseToast} />}</>
}

export default PollController
