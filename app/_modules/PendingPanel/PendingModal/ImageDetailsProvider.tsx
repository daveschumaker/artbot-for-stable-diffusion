import { JobStatus } from '_types/artbot'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'
import React, { createContext, useState } from 'react'
import useImageArray from './hooks/useImageArray'
import { getImageDetails } from 'app/_utils/db'

interface ImageSrc {
  id: string
  url: string
}

interface ImageDetailsContextType {
  imageDetails: CreateImageRequestV2
  hasError: boolean
  isCensored: boolean
  isDone: boolean
  inProgressHasImages: boolean
  isPendingOrProcessing: boolean
  inProgressNoImages: boolean
  censoredJob: boolean
  currentImageId: string
  imageSrcs: ImageSrc[]
  setCurrentImageId: (imageId: string) => void
  refreshImageDetails: (jobId: string) => void
}

const defaultContext = {
  imageDetails: {} as CreateImageRequestV2,
  hasError: false,
  isCensored: false,
  isDone: false,
  inProgressHasImages: false,
  isPendingOrProcessing: false,
  inProgressNoImages: false,
  censoredJob: false,
  currentImageId: '',
  imageSrcs: [],
  setCurrentImageId: () => {},
  refreshImageDetails: () => {}
}

export const ImageDetailsContext =
  createContext<ImageDetailsContextType>(defaultContext)

interface ImageDetailsProviderProps {
  children: React.ReactNode
  imageDetails: CreateImageRequestV2
}

export const ImageDetailsProvider: React.FC<ImageDetailsProviderProps> = ({
  children,
  imageDetails: initialImageDetails
}) => {
  const [imageDetails, setImageDetails] = useState(initialImageDetails)
  const [currentImageId, setCurrentImageId] = useState('')
  const [imageSrcs] = useImageArray({ imageDetails, setCurrentImageId })

  const refreshImageDetails = async () => {
    try {
      const updatedDetails = await getImageDetails(imageDetails.jobId)
      setImageDetails(updatedDetails)
    } catch (error) {
      console.error('Failed to refresh image details:', error)
    }
  }

  const hasError = imageDetails.jobStatus === JobStatus.Error
  const isCensored = imageDetails.images_censored > 0
  const isDone = imageDetails.jobStatus === JobStatus.Done
  const inProgressHasImages = !isDone && imageDetails.finished > 0
  const isPendingOrProcessing = !isDone && !hasError
  const inProgressNoImages = !isDone && imageDetails.finished === 0
  const censoredJob = imageDetails.numImages === imageDetails.images_censored

  console.log(`imageSrcs?`, imageSrcs)

  return (
    <ImageDetailsContext.Provider
      value={{
        imageDetails,
        hasError,
        isCensored,
        isDone,
        inProgressHasImages,
        isPendingOrProcessing,
        inProgressNoImages,
        censoredJob,
        currentImageId,
        setCurrentImageId,
        imageSrcs,
        refreshImageDetails
      }}
    >
      {children}
    </ImageDetailsContext.Provider>
  )
}

export default ImageDetailsProvider
