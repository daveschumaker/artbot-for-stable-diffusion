import { useStore } from 'statery'

import Toast from '../components/UI/Toast'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { appInfoStore, setShowImageReadyToast } from '../store/appStore'
import {
  decideNewMain,
  enablePingChecker,
  LocalStorageEvents,
  multiStore,
  onLocalStorageEvent
} from '../store/multiStore'
import { useImagePreview } from 'modules/ImagePreviewProvider'
import { getPendingJob } from 'controllers/pendingJobsCache'

const PollController = () => {
  const { showImagePreviewModal } = useImagePreview()
  const appState = useStore(appInfoStore)
  const multiState = useStore(multiStore)
  const { newImageReady, showImageReadyToast } = appState

  const handleCloseToast = () => {
    // If Toast is closed automatically (or via X), don't
    // clear newImageJobId so we can keep new image indicator
    // in NavBar
    setShowImageReadyToast(false)
  }

  const showImageModal = (jobId: string) => {
    showImagePreviewModal({
      disableNav: true,
      imageDetails: getPendingJob(jobId)
    })
  }

  useEffectOnce(() => {
    localStorage[LocalStorageEvents.New] = Date.now()

    const firstCheckDelay = 500
    setTimeout(() => {
      enablePingChecker()
      if (!multiState.otherAvailablePagesFound) {
        decideNewMain()
      }
    }, firstCheckDelay)
    window.addEventListener('storage', onLocalStorageEvent, false)
  })

  return (
    <>
      {newImageReady && (
        <Toast
          // THIS IS FOR DEBUGGING
          disableAutoClose={false}
          handleClose={handleCloseToast}
          handleImageClick={() => showImageModal(newImageReady)}
          jobId={newImageReady}
          showImageReadyToast={showImageReadyToast}
        />
      )}
    </>
  )
}

export default PollController
