import React, { useCallback, useEffect, useState } from 'react'
import { IImageDetails } from 'types'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { deletePendingJobFromDb, getImageDetails } from '../../utils/db'

// import ImageModal from '../ImageModal'
import ImageModal from '../ImageModalV2'

interface IProps {
  handleClose: () => any
  handleDeleteImage(imageId: number, jobId: string): void
  imageList: Array<any>
  initialIndexJobId: string | boolean
  onAfterDelete(): void
  reverseButtons?: boolean
}

const ImageModalController = ({
  handleClose = () => {},
  handleDeleteImage = () => {},
  initialIndexJobId = '',
  imageList = [],
  onAfterDelete = () => {}
}: IProps) => {
  const [idx, setIdx] = useState<number | null>(null)
  const [imageDetails, setImageDetails] = useState<IImageDetails>()

  const loadImageData = useCallback(async () => {
    if (idx === null) {
      return
    }

    const data = (await getImageDetails(imageList[idx].jobId)) || {}
    setImageDetails(data)
  }, [idx, imageList])

  const handleDeleteImageClick = async () => {
    if (!imageDetails) {
      return
    }

    deletePendingJobFromDb(imageDetails.jobId)
    handleDeleteImage(imageDetails.id, imageDetails.jobId)
    onAfterDelete()
    handleClose()
  }

  const handleLoadNext = useCallback(async () => {
    if (idx === null) {
      return
    }

    if (idx >= imageList.length - 1) {
      return
    }

    const newIdx = idx + 1
    const data = (await getImageDetails(imageList[newIdx].jobId)) || {}
    setImageDetails(data)
    setIdx(newIdx)
  }, [idx, imageList])

  const handleLoadPrev = useCallback(async () => {
    if (idx === null) {
      return
    }

    if (idx <= 0) {
      return
    }

    const newIdx = idx - 1
    const data = (await getImageDetails(imageList[newIdx].jobId)) || {}
    setImageDetails(data)
    setIdx(newIdx)
  }, [idx, imageList])

  useEffect(() => {
    loadImageData()
  }, [idx, imageList, loadImageData])

  useEffectOnce(() => {
    imageList.forEach((item, i) => {
      if (item.jobId === initialIndexJobId) {
        setIdx(i)
      }
    })
  })

  if (!imageDetails) {
    return null
  }

  return (
    <ImageModal
      disableNav={imageList.length <= 1}
      handleClose={handleClose}
      handleDeleteImageClick={handleDeleteImageClick}
      handleLoadNext={handleLoadNext}
      handleLoadPrev={handleLoadPrev}
      imageDetails={imageDetails}
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
