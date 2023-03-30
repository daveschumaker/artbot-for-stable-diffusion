import React, { useCallback, useEffect, useState } from 'react'
import { IImageDetails } from 'types'
import {
  findFilteredIndexById,
  getNextFilteredItem,
  getPrevFilteredItem
} from '../../store/filteredImagesCache'
import {
  deleteCompletedImage,
  deletePendingJobFromDb,
  getImageDetails,
  getNextImageDetails,
  getPrevImageDetails
} from '../../utils/db'

// import ImageModal from '../ImageModal'
import ImageModal from '../ImageModalV2'

interface IProps {
  handleClose: () => void
  imageId: string
  onAfterDelete(): void
  reverseButtons?: boolean
  useFilteredItems?: boolean
}

const ImageModalController = ({
  handleClose = () => {},
  imageId,
  onAfterDelete = () => {},
  useFilteredItems = false
}: IProps) => {
  const [imageDetails, setImageDetails] = useState<IImageDetails>()

  const loadImageData = useCallback(async () => {
    const data = (await getImageDetails(imageId)) || {}
    setImageDetails(data)
  }, [imageId])

  const handleDeleteImageClick = async () => {
    if (!imageDetails) {
      return
    }

    await deletePendingJobFromDb(imageDetails.jobId)
    await deleteCompletedImage(imageDetails.jobId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = async () => {
    if (!imageDetails) {
      return
    }

    let data
    if (useFilteredItems) {
      const idx = findFilteredIndexById(imageDetails.id)
      data = getNextFilteredItem(idx)
      setImageDetails(data)
      return
    }

    data = (await getNextImageDetails(imageDetails.timestamp)) || {}
    if (data.id) {
      setImageDetails(data)
    }
  }

  const handleLoadPrev = async () => {
    if (!imageDetails) {
      return
    }

    let data
    if (useFilteredItems) {
      const idx = findFilteredIndexById(imageDetails.id)
      data = getPrevFilteredItem(idx)
      setImageDetails(data)
      return
    }

    data = (await getPrevImageDetails(imageDetails.timestamp)) || {}
    if (data.id) {
      setImageDetails(data)
    }
  }

  useEffect(() => {
    if (imageId) {
      loadImageData()
    }
  }, [imageId, loadImageData])

  if (!imageDetails) {
    return null
  }

  return (
    <ImageModal
      handleDeleteImageClick={handleDeleteImageClick}
      handleLoadNext={handleLoadNext}
      handleLoadPrev={handleLoadPrev}
      imageDetails={imageDetails}
      // loading={loading}
      // reverseButtons={reverseButtons}
      // @ts-ignore
      handleClose={handleClose}
      // imageId={imageDetails.id}
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const idEqual = prevProps.imageId === nextProps.imageId

  return idEqual
}

export default React.memo(ImageModalController, areEqual)
