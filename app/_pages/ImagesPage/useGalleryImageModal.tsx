import useComponentState from 'hooks/useComponentState'
// import { useImagePreview } from 'modules/ImagePreviewProvider'
import { useCallback, useEffect, useState } from 'react'
import { useModal } from '@ebay/nice-modal-react'
import ImageModal from 'app/_modules/ImageModal'

const useGalleryImageModal = () => {
  const imagePreviewModal = useModal(ImageModal)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)
  const [imagesList, setImagesList] = useState([])
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
    let initialImageDetails

    images.forEach((item: any, i: number) => {
      if (item.jobId === jobId) {
        setImageIdx(i)
        setImageDetails(item)
      }
    })

    // Using initialImageDetails here instead of imageDetails from stage since there is a potential
    // race condition where the modal doesn't pop up on first click.
    if (!initialImageDetails) return

    console.log(`hehe!`)
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

  return [showImageModal, isImageModalOpen]
}

export const useGalleryImageModal_OG = () => {
  const imagePreviewModal = useModal(ImageModal)
  // const { setImageData, showImagePreviewModal } = useImagePreview()
  const [componentState, setComponentState] = useComponentState({
    imagesList: null,
    imgIdx: null,
    initJobId: null,
    jobId: null
  })

  const [onAfterDelete, setOnAfterDelete] = useState<() => any>(() => {})

  const showImageModal = ({
    jobId,
    imagesList,
    fetchImages = () => {}
  }: {
    jobId: string
    imagesList: Array<any>
    fetchImages?: () => any
  }) => {
    let imgIdx

    imagesList.forEach((item: any, i: number) => {
      if (item.jobId === jobId) {
        imgIdx = i
      }
    })

    setComponentState({
      imagesList,
      imgIdx,
      initJobId: jobId,
      jobId
    })

    setOnAfterDelete(() => fetchImages)
  }

  const handleLoadNext = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.imagesList) {
      return
    }

    let newIdx = componentState.imgIdx + 1

    if (newIdx > componentState.imagesList.length - 1) {
      return
    }

    const jobId = componentState.imagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })

    // const imageDetails = componentState.imagesList[newIdx]
    // setImageData(imageDetails)
  }, [componentState, setComponentState])

  const handleLoadPrev = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.imagesList) {
      return
    }

    let newIdx = componentState.imgIdx - 1
    if (newIdx < 0) {
      return
    }

    const jobId = componentState.imagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })

    // const imageDetails = componentState.imagesList[newIdx]
    // setImageData(imageDetails)
  }, [componentState, setComponentState])

  const triggerModal = useCallback(() => {
    const imageDetails = componentState.imagesList[componentState.imgIdx]

    imagePreviewModal.show({
      disableNav: false,
      imageDetails,
      handleClose: () => imagePreviewModal.remove(),
      handleLoadNext,
      handleLoadPrev,
      onCloseCallback: () => {
        setComponentState({
          imgIdx: null,
          initJobId: null,
          jobId: null,
          imagesList: null
        })
        onAfterDelete()
      },
      onDeleteCallback: () => {
        setComponentState({
          imgIdx: null,
          initJobId: null,
          jobId: null,
          imagesList: null
        })
      }
    })
  }, [
    componentState.imagesList,
    componentState.imgIdx,
    handleLoadNext,
    handleLoadPrev,
    imagePreviewModal,
    onAfterDelete,
    setComponentState
  ])

  useEffect(() => {
    if (componentState.imagesList) {
      triggerModal()
    }
  }, [componentState.imagesList, triggerModal])

  return [showImageModal]
}

export default useGalleryImageModal
