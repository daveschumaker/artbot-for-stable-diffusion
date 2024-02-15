import ImageModel from 'app/_data-models/v2/ImageModel'
import { getAllImages, getFirstImagePerJobID } from 'app/_db/image_files'
import { useEffect, useState } from 'react'

interface UseGetImagesProps {
  groupByJobId?: boolean
}

export default function useGetImages({
  groupByJobId = false
}: UseGetImagesProps = {}) {
  const [images, setImages] = useState<ImageModel[]>([])

  const getImages = async () => {
    const data = await getAllImages()
    setImages(data as ImageModel[])
  }

  const getImagesGroupedByJobId = async () => {
    const data = await getFirstImagePerJobID()
    setImages(data as ImageModel[])
  }

  useEffect(() => {
    if (groupByJobId) {
      getImagesGroupedByJobId()
    } else {
      getImages()
    }
  }, [groupByJobId])

  return [images]
}
