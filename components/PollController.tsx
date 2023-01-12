import { useState } from 'react'
import { useEffect } from 'react'
import { useStore } from 'statery'

import Toast from '../components/UI/Toast'
import { POLL_COMPLETED_JOBS_INTERVAL } from '../constants'
import { appInfoStore, setShowImageReadyToast } from '../store/appStore'
import {
  decideNewMain,
  enablePingChecker,
  LocalStorageEvents,
  multiStore,
  onLocalStorageEvent
} from '../store/multiStore'
import { isAppActive } from '../utils/appUtils'
import { hackyMultiJobCheck } from '../utils/imageCache'
import ImageModal from './ImageModal'

const PollController = () => {
  const appState = useStore(appInfoStore)
  const multiState = useStore(multiStore)
  const [showImageModal, setShowImageModal] = useState<boolean | string>(false)

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
    localStorage[LocalStorageEvents.New] = Date.now()

    const firstCheckDelay = 500
    setTimeout(() => {
      enablePingChecker()
      if (!multiState.otherAvailablePagesFound) {
        decideNewMain()
      }
    }, firstCheckDelay)
    window.addEventListener('storage', onLocalStorageEvent, false)

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
      {/* {showImageModal && (
        <ImageModal
          handleClose={() => setShowImageModal(false)}
          jobId={showImageModal}
        />
      )} */}
      {newImageReady && (
        <Toast
          handleClose={handleCloseToast}
          jobId={newImageReady}
          showImageReadyToast={showImageReadyToast}
          handleImageClick={() => setShowImageModal(newImageReady)}
        />
      )}
    </>
  )
}

export default PollController
