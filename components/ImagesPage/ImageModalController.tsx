import React, { useCallback, useEffect, useState } from 'react'
import {
  deleteCompletedImage,
  getImageDetails,
  getNextImageDetails,
  getPrevImageDetails
} from '../../utils/db'
import ImageModal from '../ImageModal'

interface IProps {
  handleClose(): void
  imageId: string
  onAfterDelete(): void
}

interface IImageDetails {
  id: number
}

const ImageModalController = ({
  handleClose = () => {},
  imageId,
  onAfterDelete = () => {}
}: IProps) => {
  const [loading, setLoading] = useState(true)
  const [imageDetails, setImageDetails] = useState<IImageDetails>({
    id: 0
  })

  const loadImageData = useCallback(async () => {
    const data = (await getImageDetails(imageId)) || {}
    setImageDetails(data)
    setLoading(false)
  }, [imageId])

  const handleDeleteImageClick = async () => {
    await deleteCompletedImage(imageId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = async () => {
    const data = (await getNextImageDetails(imageDetails.id)) || {}
    if (data.id) {
      setImageDetails(data)
    }
    setLoading(false)
  }

  const handleLoadPrev = async () => {
    if (imageDetails.id <= 1) {
      setLoading(false)
      return
    }

    const data = (await getPrevImageDetails(imageDetails.id)) || {}
    if (data.id) {
      setImageDetails(data)
    }
    setImageDetails(data)
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
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const idEqual = prevProps.imageId === nextProps.imageId

  return idEqual
}

export default React.memo(ImageModalController, areEqual)
