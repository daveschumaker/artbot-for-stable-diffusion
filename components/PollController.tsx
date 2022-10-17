import { useCallback, useEffect } from 'react'
import { useStore } from 'statery'

import Toast from '../components/Toast'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../store/appStore'
import { getCurrentJob } from '../utils/imageCache'

const PollController = () => {
  const appState = useStore(appInfoStore)
  const { newImageReady, showImageReadyToast } = appState

  const handleCloseToast = () => {
    // If Toast is closed automatically (or via X), don't
    // clear newImageJobId so we can keep new image indicator
    // in NavBar
    setShowImageReadyToast(false)
  }

  const checkForCompletedJob = useCallback(async () => {
    console.log(`${new Date().toLocaleString()} polling`)
    const jobDetails = await getCurrentJob()

    if (jobDetails?.newImage && !showImageReadyToast) {
      setNewImageReady(jobDetails.jobId)
      setShowImageReadyToast(true)
    }
  }, [showImageReadyToast])

  useEffect(() => {
    const interval = setInterval(async () => {
      checkForCompletedJob()
    }, 5000)

    return () => clearInterval(interval)
  }, [checkForCompletedJob])

  return (
    <>
      <Toast
        handleClose={handleCloseToast}
        jobId={newImageReady}
        showImageReadyToast={showImageReadyToast}
      />
    </>
  )
}

export default PollController
