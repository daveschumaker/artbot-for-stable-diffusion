import ErrorComponent, { logErrorInComponent } from 'components/ErrorComponent'
import { deletePendingJob, getPendingJob } from 'controllers/pendingJobsCache'
import React, { useCallback, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { IImageDetails } from 'types'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { deletePendingJobFromDb } from '../../utils/db'

// import ImageModal from '../ImageModal'
import ImageModal from '../ImageModalV2'

interface IProps {
  handleClose: () => any
  handleDeleteImage(jobId: string): void
  imageList: Array<any>
  initialIndexJobId: string | boolean
  onAfterDelete(): void
  reverseButtons?: boolean
}

const ImageModalController = ({
  handleClose = () => {},
  handleDeleteImage = () => {},
  initialIndexJobId = '',
  imageList = [],
  onAfterDelete = () => {}
}: IProps) => {
  const [idx, setIdx] = useState<number | null>(null)
  const [imageDetails, setImageDetails] = useState<IImageDetails>()

  const loadImageData = useCallback(async () => {
    if (
      !imageList ||
      typeof idx === 'undefined' ||
      idx === null ||
      !imageList[idx]
    ) {
      return
    }

    const data = getPendingJob(imageList[idx].jobId) || {}
    // @ts-ignore
    setImageDetails(data)
  }, [idx, imageList])

  const handleDeleteImageClick = async () => {
    if (!imageDetails) {
      return
    }

    deletePendingJob(imageDetails.jobId)
    deletePendingJobFromDb(imageDetails.jobId)
    handleDeleteImage(imageDetails.jobId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = useCallback(async () => {
    if (idx === null) {
      return
    }

    if (idx >= imageList.length - 1) {
      return
    }

    const newIdx = idx + 1
    const data = getPendingJob(imageList[newIdx].jobId) || {}
    // @ts-ignore
    setImageDetails(data)
    setIdx(newIdx)
  }, [idx, imageList])

  const handleLoadPrev = useCallback(async () => {
    if (idx === null) {
      return
    }

    if (idx <= 0) {
      return
    }

    const newIdx = idx - 1
    const data = getPendingJob(imageList[newIdx].jobId) || {}
    // @ts-ignore
    setImageDetails(data)
    setIdx(newIdx)
  }, [idx, imageList])

  const handleReloadImageData = useCallback(async () => {
    loadImageData()
  }, [loadImageData])

  useEffect(() => {
    loadImageData()
  }, [idx, imageList, loadImageData])

  useEffectOnce(() => {
    imageList.forEach((item, i) => {
      if (item.jobId === initialIndexJobId) {
        setIdx(i)
      }
    })
  })

  if (!imageDetails) {
    return null
  }

  const logError = (error: Error, info: { componentStack: string }) => {
    const componentName = 'PendingPage.ImageModalController'
    logErrorInComponent(error, info, componentName)
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorComponent} onError={logError}>
      <ImageModal
        disableNav={imageList.length <= 1}
        handleClose={handleClose}
        handleDeleteImageClick={handleDeleteImageClick}
        handleLoadNext={handleLoadNext}
        handleLoadPrev={handleLoadPrev}
        handleReloadImageData={handleReloadImageData}
        imageDetails={imageDetails}
      />
    </ErrorBoundary>
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const initIdxEqual =
    prevProps.initialIndexJobId === nextProps.initialIndexJobId
  const listEqual = prevProps.imageList === nextProps.imageList

  return listEqual && initIdxEqual
}

export default React.memo(ImageModalController, areEqual)
