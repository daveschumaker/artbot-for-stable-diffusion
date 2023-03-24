import React, { useCallback, useEffect, useState } from 'react'
import { IImageDetails } from 'types'
import { deleteCompletedImageById, getImageDetails } from '../../utils/db'
// import ImageModal from '../ImageModal'
import ImageModal from '../ImageModalV2'

interface IProps {
  handleClose(): void
  imageId: string
  onAfterDelete(): void
}

const PollingImageController = ({
  handleClose = () => {},
  imageId,
  onAfterDelete = () => {}
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

    await deleteCompletedImageById(imageDetails.id)
    onAfterDelete()
    handleClose()
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
      disableNav
      handleClose={handleClose}
      handleDeleteImageClick={handleDeleteImageClick}
      imageDetails={imageDetails}
      // loading={loading}
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const idEqual = prevProps.imageId === nextProps.imageId

  return idEqual
}

export default React.memo(PollingImageController, areEqual)
