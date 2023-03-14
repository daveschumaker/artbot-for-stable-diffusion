import React, { useCallback, useEffect, useState } from 'react'
import {
  findFilteredIndexById,
  getNextFilteredItem,
  getPrevFilteredItem
} from '../../store/filteredImagesCache'
import {
  deleteCompletedImageById,
  getImageDetails,
  getNextImageDetails,
  getPrevImageDetails
} from '../../utils/db'
import ImageModal from '../ImageModal'

interface IProps {
  handleClose(): void
  imageId: string
  onAfterDelete(): void
  reverseButtons?: boolean
  useFilteredItems?: boolean
}

interface IImageDetails {
  id: number
  timestamp: number
}

const ImageModalController = ({
  handleClose = () => {},
  imageId,
  onAfterDelete = () => {},
  reverseButtons = false,
  useFilteredItems = false
}: IProps) => {
  const [loading, setLoading] = useState(true)
  const [imageDetails, setImageDetails] = useState<IImageDetails>({
    id: 0,
    timestamp: 0
  })

  const loadImageData = useCallback(async () => {
    const data = (await getImageDetails(imageId)) || {}
    setImageDetails(data)
    setLoading(false)
  }, [imageId])

  const handleDeleteImageClick = async () => {
    await deleteCompletedImageById(imageDetails.id)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = async () => {
    let data
    if (useFilteredItems) {
      const idx = findFilteredIndexById(imageDetails.id)
      data = getPrevFilteredItem(idx)
      setImageDetails(data)
      setLoading(false)
      return
    }

    data = (await getNextImageDetails(imageDetails.timestamp)) || {}
    if (data.id) {
      setImageDetails(data)
    }
    setLoading(false)
  }

  const handleLoadPrev = async () => {
    let data
    if (useFilteredItems) {
      const idx = findFilteredIndexById(imageDetails.id)
      data = getNextFilteredItem(idx)
      setImageDetails(data)
      setLoading(false)
      return
    }


    data = (await getPrevImageDetails(imageDetails.timestamp)) || {}
    if (data.id) {
      setImageDetails(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (imageId) {
      setLoading(true)
      loadImageData()
    }
  }, [imageId, loadImageData])

  return (
    <ImageModal
      handleClose={handleClose}
      handleDeleteImageClick={handleDeleteImageClick}
      handleLoadNext={handleLoadNext}
      handleLoadPrev={handleLoadPrev}
      imageDetails={imageDetails}
      loading={loading}
      reverseButtons={reverseButtons}
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const idEqual = prevProps.imageId === nextProps.imageId

  return idEqual
}

export default React.memo(ImageModalController, areEqual)
