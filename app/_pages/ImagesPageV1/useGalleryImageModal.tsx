import { useCallback, useEffect, useState } from 'react'
import { useModal } from '@ebay/nice-modal-react'
import ImageModal from 'app/_modules/ImageModal'
import {
  setImageDetailsModalOpen,
  updateAdEventTimestamp
} from 'app/_store/appStore'

const useGalleryImageModal = ({ fetchImages }: { fetchImages: any }) => {
  const imagePreviewModal = useModal(ImageModal)
  const [imageIdx, setImageIdx] = useState(0)
  const [imagesList, setImagesList] = useState<any[]>([])
  const [imageDetails, setImageDetails] = useState(null)

  const handleClose = useCallback(async () => {
    await fetchImages()
    updateAdEventTimestamp()
    setImageIdx(0)
    setImagesList([])
    setImageDetails(null)
    setImageDetailsModalOpen(false)
  }, [fetchImages])

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

    setImageDetailsModalOpen(true)
  }, [
    handleClose,
    handleLoadNext,
    handleLoadPrev,
    imageDetails,
    imagePreviewModal
  ])

  useEffect(() => {
    if (!imageDetails) return
    loadModal()

    // DO NOT ADD "loadModal()" to this dep array. Otherwise we get a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDetails])

  return [showImageModal]
}

export default useGalleryImageModal
