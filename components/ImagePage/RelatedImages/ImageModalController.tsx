import React, { useCallback, useEffect, useState } from 'react'
import { IImageDetails } from 'types'
import { deleteCompletedImage } from '../../../utils/db'
// import ImageModal from '../../ImageModal'
import ImageModal from '../../ImageModalV2'

interface IProps {
  handleClose(): void
  imageList: Array<any>
  initialIndexJobId: string
  onAfterDelete(): void
}

const ImageModalController = ({
  handleClose = () => {},
  initialIndexJobId = '',
  imageList = [],
  onAfterDelete = () => {}
}: IProps) => {
  const [idx, setIdx] = useState(0)
  const [imageDetails, setImageDetails] = useState<IImageDetails>()

  const loadImageData = useCallback(async () => {
    setImageDetails(imageList[idx])
  }, [idx, imageList])

  const handleDeleteImageClick = async () => {
    await deleteCompletedImage(imageList[idx].jobId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = async () => {
    if (idx >= imageList.length - 1) {
      return
    }

    const newIdx = idx + 1
    setImageDetails(imageList[newIdx])
    setIdx(newIdx)
  }

  const handleLoadPrev = async () => {
    if (idx <= 0) {
      return
    }

    const newIdx = idx - 1

    setImageDetails(imageList[newIdx])
    setIdx(newIdx)
  }

  useEffect(() => {
    loadImageData()
  }, [imageList, loadImageData])

  useEffect(() => {
    imageList.filter((item, i) => {
      if (item.jobId === initialIndexJobId) {
        setIdx(i)
      }
    })
  }, [imageList, initialIndexJobId])

  if (!imageDetails) {
    return null
  }

  return (
    <ImageModal
      handleClose={handleClose}
      handleDeleteImageClick={handleDeleteImageClick}
      handleLoadNext={handleLoadNext}
      handleLoadPrev={handleLoadPrev}
      imageDetails={imageDetails}
    />
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const listEqual = prevProps.imageList === nextProps.imageList

  return listEqual
}

export default React.memo(ImageModalController, areEqual)
