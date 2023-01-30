import React, { useCallback, useEffect, useState } from 'react'
import { getImageDetails } from '../../utils/db'
import ImageModal from '../ImageModal'

interface IProps {
  handleClose(): void
  handleDeleteImage(imageId: string): void
  imageList: Array<any>
  initialIndexJobId: string | boolean
  onAfterDelete(): void
  reverseButtons?: boolean
}

interface IImageDetails {
  id: number
  jobId: string
}

const ImageModalController = ({
  handleClose = () => {},
  handleDeleteImage = () => {},
  initialIndexJobId = '',
  imageList = [],
  onAfterDelete = () => {},
  reverseButtons = false
}: IProps) => {
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [imageDetails, setImageDetails] = useState<IImageDetails>({
    id: 0,
    jobId: ''
  })

  const loadImageData = useCallback(async () => {
    const data = (await getImageDetails(imageList[idx].jobId)) || {}
    setImageDetails(data)
    setLoading(false)
  }, [idx, imageList])

  const handleDeleteImageClick = async (imageId: string) => {
    handleDeleteImage(imageId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = useCallback(async () => {
    if (idx >= imageList.length - 1) {
      setLoading(false)
      return
    }

    const newIdx = idx + 1
    const data = (await getImageDetails(imageList[newIdx].jobId)) || {}
    setImageDetails(data)
    setIdx(newIdx)
    setLoading(false)
  }, [idx, imageList])

  const handleLoadPrev = useCallback(async () => {
    if (idx <= 0) {
      setLoading(false)
      return
    }

    const newIdx = idx - 1
    const data = (await getImageDetails(imageList[newIdx].jobId)) || {}
    setImageDetails(data)
    setIdx(newIdx)
    setLoading(false)
  }, [idx, imageList])

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
      disableNav={imageList.length <= 1}
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
  const initIdxEqual =
    prevProps.initialIndexJobId === nextProps.initialIndexJobId
  const listEqual = prevProps.imageList === nextProps.imageList

  return listEqual && initIdxEqual
}

export default React.memo(ImageModalController, areEqual)
