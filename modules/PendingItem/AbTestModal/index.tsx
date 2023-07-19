/* eslint-disable @next/next/no-img-element */
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import PageTitle from 'app/_components/PageTitle'
import styles from './component.module.css'
import { useCallback, useState } from 'react'
import clsx from 'clsx'
import { Button } from 'components/UI/Button'
import { clientHeader, getApiHostServer } from 'utils/appUtils'
import AppSettings from 'models/AppSettings'
import {
  getImageDetails,
  updateCompletedJob,
  updatePendingJobInDexie
} from 'utils/db'
import { updatePendingJobProperties } from 'controllers/pendingJobsCache'
import NiceModal, { useModal } from '@ebay/nice-modal-react'

function AbTestModal({
  jobDetails,
  secondaryId,
  secondaryImage,
  setIsRated = () => {}
}: {
  jobDetails: any
  secondaryId: string
  secondaryImage: string
  setIsRated: (value: boolean) => any
}) {
  const modal = useModal()
  const [selectedImg, setSelectedImg] = useState(0)

  const handleClose = () => {
    modal.remove()
  }

  const handleRateImage = useCallback(async () => {
    const imageId = selectedImg === 1 ? jobDetails.hordeImageId : secondaryId

    try {
      await fetch(
        `${getApiHostServer()}/api/v2/generate/rate/${jobDetails.jobId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            best: imageId
          }),
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader(),
            apikey: AppSettings.get('apiKey')
          }
        }
      )

      const imageDetailsFromCompleted = await getImageDetails(jobDetails.jobId)

      updatePendingJobProperties(jobDetails.jobId, {
        base64String:
          selectedImg === 1 ? jobDetails.base64String : secondaryImage,
        ratingSubmitted: true,
        thumbnail: null
      })

      await updatePendingJobInDexie(jobDetails.id, {
        base64String:
          selectedImg === 1 ? jobDetails.base64String : secondaryImage,
        ratingSubmitted: true,
        thumbnail: null
      })

      await updateCompletedJob(imageDetailsFromCompleted.id, {
        base64String:
          selectedImg === 1 ? jobDetails.base64String : secondaryImage,
        ratingSubmitted: true,
        thumbnail: null
      })

      setIsRated(true)
      handleClose()
    } catch (e) {
      console.log(e)
    }
  }, [
    handleClose,
    jobDetails.base64String,
    jobDetails.hordeImageId,
    jobDetails.id,
    jobDetails.jobId,
    secondaryId,
    secondaryImage,
    selectedImg,
    setIsRated
  ])

  return (
    <InteractiveModal className={styles.ModalStyle} handleClose={handleClose}>
      <div>
        <PageTitle>SDXL: Choose the best image</PageTitle>
      </div>
      <div className={styles.Images} style={{ marginBottom: '12px' }}>
        <img
          className={clsx(
            styles.ImageElement,
            selectedImg !== 0 && selectedImg !== 1 && styles.NotSelected
          )}
          src={'data:image/webp;base64,' + jobDetails.base64String}
          alt={jobDetails.prompt}
          onClick={() => setSelectedImg(1)}
          style={{
            border: selectedImg === 1 ? '4px solid var(--main-color)' : 'unset'
          }}
        />

        <img
          className={clsx(
            styles.ImageElement,
            selectedImg !== 0 && selectedImg !== 2 && styles.NotSelected
          )}
          src={'data:image/webp;base64,' + secondaryImage}
          alt={jobDetails.prompt}
          onClick={() => setSelectedImg(2)}
          style={{
            border: selectedImg === 2 ? '4px solid var(--main-color)' : 'unset'
          }}
        />
      </div>
      <div
        className="flex flex-row w-full justify-center"
        style={{ fontSize: '14px', marginBottom: '8px' }}
      >
        Choose which image you think looks the best. The result will be sent
        back to Stability.ai in order to further improve SDXL. In return, you
        will receive 15 kudos per image rated.
      </div>
      <div
        className="flex flex-row w-full justify-center"
        style={{ marginBottom: '12px' }}
      >
        <Button
          disabled={selectedImg === 0}
          onClick={() => {
            if (selectedImg === 0) return
            handleRateImage()
          }}
        >
          Select favorite image
        </Button>
      </div>
    </InteractiveModal>
  )
}

export default NiceModal.create(AbTestModal)
