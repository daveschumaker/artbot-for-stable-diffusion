import React, { useCallback, useEffect, useState } from 'react'
import { deleteCompletedImage, getImageDetails } from '../../utils/db'
import ImageModal from '../ImageModal'

interface IProps {
  handleClose(): void
  imageId: string
  onAfterDelete(): void
}

interface IImageDetails {
  id: number
}

const PollingImageController = ({
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

  useEffect(() => {
    if (imageId) {
      setLoading(true)
      loadImageData()
    }
  }, [imageId, loadImageData])

  return (
    <ImageModal
      disableNav
      handleClose={handleClose}
      handleDeleteImageClick={handleDeleteImageClick}
      imageDetails={imageDetails}
      loading={loading}
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const idEqual = prevProps.imageId === nextProps.imageId

  return idEqual
}

export default React.memo(PollingImageController, areEqual)
