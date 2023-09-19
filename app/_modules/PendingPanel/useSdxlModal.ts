import { useCallback, useEffect, useState } from 'react'
import { getJobImagesFromDexie } from 'app/_utils/db'

export default function useSdxlModal(jobDetails: any) {
  const [secondaryImage, setSecondaryImage] = useState<string>('') // SDXL_beta
  const [secondaryId, setSecondaryId] = useState<string>('') // SDXL_beta

  const { jobId, jobStatus, ratingSubmitted } = jobDetails

  const getAdditionalImage = useCallback(async () => {
    const images = await getJobImagesFromDexie(jobId)
    const [image] = images

    if (image && 'base64String' in image) {
      setSecondaryImage(image.base64String)
      setSecondaryId(image.hordeImageId)
    }

    // Need to listen to change in jobStatus to fetch new images
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, jobStatus])

  useEffect(() => {
    getAdditionalImage()
  }, [getAdditionalImage])

  const isSdxlAbTest = secondaryImage && !ratingSubmitted

  return [isSdxlAbTest, secondaryId as string, secondaryImage as string]
}
