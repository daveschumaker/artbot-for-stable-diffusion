import useComponentState from 'hooks/useComponentState'
import { useImagePreview } from 'modules/ImagePreviewProvider'
import { useCallback, useEffect, useState } from 'react'

const useRelatedImageModal = () => {
  const { setImageData, showImagePreviewModal } = useImagePreview()
  const [componentState, setComponentState] = useComponentState({
    imagesList: null,
    imgIdx: null,
    initJobId: null,
    jobId: null
  })

  const [onAfterDelete, setOnAfterDelete] = useState<() => any>(() => {})

  const showImageModal = ({
    jobId,
    imagesList,
    fetchImages = () => {}
  }: {
    jobId: string
    imagesList: Array<any>
    fetchImages?: () => any
  }) => {
    let imgIdx

    imagesList.forEach((item: any, i: number) => {
      if (item.jobId === jobId) {
        imgIdx = i
      }
    })

    setComponentState({
      imagesList,
      imgIdx,
      initJobId: jobId,
      jobId
    })

    setOnAfterDelete(() => fetchImages)
  }

  const handleLoadNext = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.imagesList) {
      return
    }

    let newIdx = componentState.imgIdx + 1

    if (newIdx > componentState.imagesList.length - 1) {
      return
    }

    const jobId = componentState.imagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })

    const imageDetails = componentState.imagesList[newIdx]
    setImageData(imageDetails)
  }, [componentState, setComponentState, setImageData])

  const handleLoadPrev = useCallback(() => {
    if (componentState.imgIdx === null) {
      return
    }

    if (!componentState.imagesList) {
      return
    }

    let newIdx = componentState.imgIdx - 1
    if (newIdx < 0) {
      return
    }

    const jobId = componentState.imagesList[newIdx].jobId
    setComponentState({
      jobId,
      imgIdx: newIdx
    })

    const imageDetails = componentState.imagesList[newIdx]
    setImageData(imageDetails)
  }, [componentState, setComponentState, setImageData])

  const triggerModal = useCallback(
    () => {
      const imageDetails = componentState.imagesList[componentState.imgIdx]

      showImagePreviewModal({
        disableNav: false,
        imageDetails,
        handleLoadNext,
        handleLoadPrev,
        onCloseCallback: () => {
          setComponentState({
            imgIdx: null,
            initJobId: null,
            jobId: null,
            imagesList: null
          })
          onAfterDelete()
        },
        onDeleteCallback: () => {
          setComponentState({
            imgIdx: null,
            initJobId: null,
            jobId: null,
            imagesList: null
          })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [componentState, showImagePreviewModal]
  )

  useEffect(() => {
    if (componentState.imagesList) {
      triggerModal()
    }
  }, [componentState.imagesList, triggerModal])

  return [showImageModal]
}

export default useRelatedImageModal
