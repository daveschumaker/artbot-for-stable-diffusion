'use client'

import { useStore } from 'statery'

import Toast from '../Toast'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import {
  appInfoStore,
  setImageDetailsModalOpen,
  setShowImageReadyToast
} from 'app/_store/appStore'
import {
  decideNewMain,
  enablePingChecker,
  LocalStorageEvents,
  multiStore,
  onLocalStorageEvent
} from 'app/_store/multiStore'
import { useModal } from '@ebay/nice-modal-react'
import ImageModal from '../ImageModal'
import { getImageDetails } from 'app/_utils/db'

const PollController = () => {
  const imagePreviewModal = useModal(ImageModal)
  const appState = useStore(appInfoStore)
  const multiState = useStore(multiStore)
  const { newImageReady, showImageReadyToast } = appState

  const handleCloseToast = () => {
    // If Toast is closed automatically (or via X), don't
    // clear newImageJobId so we can keep new image indicator
    // in NavBar
    setShowImageReadyToast(false)
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
          handleImageClick={async () => {
            const imageDetails = await getImageDetails(newImageReady)
            setImageDetailsModalOpen(true)
            imagePreviewModal.show({
              handleClose: () => imagePreviewModal.remove(),
              imageDetails
            })
          }}
          jobId={newImageReady}
          showImageReadyToast={showImageReadyToast}
        />
      )}
    </>
  )
}

export default PollController
