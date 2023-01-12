import React, { useCallback, useEffect, useState } from 'react'
import { deleteCompletedImage } from '../../../utils/db'
import ImageModal from '../../ImageModal'

interface IProps {
  handleClose(): void
  imageList: Array<any>
  initialIndexJobId: string
  onAfterDelete(): void
}

interface IImageDetails {
  id: number
  jobId: string
}

const ImageModalController = ({
  handleClose = () => {},
  initialIndexJobId = '',
  imageList = [],
  onAfterDelete = () => {}
}: IProps) => {
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [imageDetails, setImageDetails] = useState<IImageDetails>({
    id: 0,
    jobId: ''
  })

  const loadImageData = useCallback(async () => {
    setImageDetails(imageList[idx])
    setLoading(false)
  }, [idx, imageList])

  const handleDeleteImageClick = async () => {
    await deleteCompletedImage(imageList[idx].jobId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = async () => {
    setLoading(true)
    if (idx >= imageList.length - 1) {
      setLoading(false)
      return
    }

    const newIdx = idx + 1
    setImageDetails(imageList[newIdx])
    setIdx(newIdx)
    setLoading(false)
  }

  const handleLoadPrev = async () => {
    setLoading(true)
    if (idx <= 0) {
      setLoading(false)
      return
    }

    const newIdx = idx - 1

    setImageDetails(imageList[newIdx])
    setIdx(newIdx)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadImageData()
  }, [imageList, loadImageData])

  useEffect(() => {
    imageList.filter((item, i) => {
      if (item.jobId === initialIndexJobId) {
        setIdx(i)
      }
    })
  }, [imageList, initialIndexJobId])

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
  const listEqual = prevProps.imageList === nextProps.imageList

  return listEqual
}

export default React.memo(ImageModalController, areEqual)
