import { useEffect } from 'react'
import { useStore } from 'statery'

import Toast from '../components/UI/Toast'
import { POLL_COMPLETED_JOBS_INTERVAL } from '../constants'
import { appInfoStore, setShowImageReadyToast } from '../store/appStore'
import { isAppActive } from '../utils/appUtils'
import { hackyMultiJobCheck } from '../utils/imageCache'

const PollController = () => {
  const appState = useStore(appInfoStore)
  const { newImageReady, showImageReadyToast } = appState

  const handleCloseToast = () => {
    // If Toast is closed automatically (or via X), don't
    // clear newImageJobId so we can keep new image indicator
    // in NavBar
    setShowImageReadyToast(false)
  }

  const checkForCompletedJob = async () => {
    await hackyMultiJobCheck()
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      // If user has multiple tabs open, prevent firing off numerous API calls.
      if (!isAppActive()) {
        return
      }

      checkForCompletedJob()
    }, POLL_COMPLETED_JOBS_INTERVAL)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {newImageReady && (
        <Toast
          handleClose={handleCloseToast}
          jobId={newImageReady}
          showImageReadyToast={showImageReadyToast}
        />
      )}
    </>
  )
}

export default PollController
