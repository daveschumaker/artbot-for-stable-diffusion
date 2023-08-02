import { useModal } from '@ebay/nice-modal-react'
import ImageModal from 'app/_modules/ImageModal'
import { getAllPendingJobs, getPendingJob } from 'controllers/pendingJobsCache'
import useComponentState from 'hooks/useComponentState'
import { useCallback, useEffect, useState } from 'react'
import { JobStatus } from 'types'

const usePendingImageModal = () => {
  const imagePreviewModal = useModal(ImageModal)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)
  const [imagesList, setImagesList] = useState<any[]>([])
  const [imageDetails, setImageDetails] = useState(null)

  const handleClose = () => {
    setImageIdx(0)
    setImagesList([])
    setImageDetails(null)
    setIsImageModalOpen(false)
  }

  const handleLoadNext = useCallback(() => {
    if (imagesList.length === 0) {
      return
    }

    let newIdx = imageIdx + 1
    if (newIdx > imagesList.length - 1) {
      return
    }

    setImageIdx(newIdx)
    setImageDetails(imagesList[newIdx])
  }, [imageIdx, imagesList])

  const handleLoadPrev = useCallback(() => {
    if (imagesList.length === 0) {
      return
    }

    let newIdx = imageIdx - 1
    if (newIdx < 0) {
      return
    }

    setImageIdx(newIdx)
    setImageDetails(imagesList[newIdx])
  }, [imageIdx, imagesList])

  const showImageModal = ({
    images,
    jobId
  }: {
    images: any[]
    jobId: string
  }) => {
    if (!Array.isArray(images) || images.length === 0) return
    setImagesList(images)

    images.forEach((item: any, i: number) => {
      if (item.jobId === jobId) {
        setImageIdx(i)
        setImageDetails(item)
      }
    })
  }

  const loadModal = useCallback(() => {
    if (!imageDetails) return

    imagePreviewModal.show({
      handleClose,
      handleLoadNext,
      handleLoadPrev,
      imageDetails
    })

    if (!isImageModalOpen) {
      setIsImageModalOpen(true)
    }
  }, [
    handleLoadNext,
    handleLoadPrev,
    imageDetails,
    imagePreviewModal,
    isImageModalOpen
  ])

  useEffect(() => {
    if (!imageDetails) return
    loadModal()

    // DO NOT ADD "loadModal()" to this dep array. Otherwise we get a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDetails])

  return [showImageModal]
}

export const usePendingImageModalOG = () => {
  const imagePreviewModal = useModal(ImageModal)
  // const { setImageData, showImagePreviewModal } = useImagePreview()

  const [componentState, setComponentState] = useComponentState({
    imgIdx: null,
    initJobId: null,
    jobId: null,
    pendingImagesList: null
  })

  const showImageModal = (jobId: string) => {
    setComponentState({
      jobId,
      initJobId: jobId
    })
  }

  const handleLoadNext = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.pendingImagesList) {
      return
    }

    let newIdx = componentState.imgIdx + 1

    if (newIdx > componentState.pendingImagesList.length - 1) {
      return
    }

    const jobId = componentState.pendingImagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })

    // setImageData(getPendingJob(jobId))
    imagePreviewModal.show({
      // @ts-ignore
      imageDetails: getPendingJob(jobId)
    })
  }, [
    componentState.imgIdx,
    componentState.pendingImagesList,
    imagePreviewModal,
    setComponentState
  ])

  const handleLoadPrev = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.pendingImagesList) {
      return
    }

    let newIdx = componentState.imgIdx - 1
    if (newIdx < 0) {
      return
    }

    const jobId = componentState.pendingImagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })
    // setImageData(getPendingJob(jobId))
    imagePreviewModal.show({
      // @ts-ignore
      imageDetails: getPendingJob(jobId)
    })
  }, [
    componentState.imgIdx,
    componentState.pendingImagesList,
    imagePreviewModal,
    setComponentState
  ])

  const triggerModal = useCallback(() => {
    imagePreviewModal.show({
      disableNav: false,
      // @ts-ignore
      imageDetails: getPendingJob(componentState.jobId),
      handleLoadNext,
      handleLoadPrev,
      onCloseCallback: () => {
        setComponentState({
          imgIdx: null,
          initJobId: null,
          jobId: null,
          pendingImagesList: null
        })
      },
      onDeleteCallback: () => {
        setComponentState({
          imgIdx: null,
          initJobId: null,
          jobId: null,
          pendingImagesList: null
        })
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentState.jobId, imagePreviewModal])

  useEffect(() => {
    if (componentState.pendingImagesList) {
      triggerModal()
    }
  }, [componentState.pendingImagesList, triggerModal])

  useEffect(() => {
    if (!componentState.initJobId) {
      return
    }

    let imgIdx

    // Freezes currently finished images list, so that
    // list doesn't jump around while navigating.
    let pendingImagesList = getAllPendingJobs(JobStatus.Done)

    // TODO: Make this more extensible by passing in a sort function.
    pendingImagesList = pendingImagesList.sort((a: any = {}, b: any = {}) => {
      if (a.id < b.id) {
        return -1
      }

      if (a.id > b.id) {
        return 1
      }

      return 0
    })

    pendingImagesList.forEach((item: any, i: number) => {
      if (item.jobId === componentState.jobId) {
        imgIdx = i
      }
    })

    setComponentState({
      imgIdx,
      pendingImagesList
    })

    // Only run this on initial load of image.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentState.initJobId])

  return [showImageModal]
}

export default usePendingImageModal
