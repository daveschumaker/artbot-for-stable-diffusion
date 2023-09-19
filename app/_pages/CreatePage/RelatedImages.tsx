import { useCallback, useEffect, useState } from 'react'
import { fetchRelatedImages } from 'app/_utils/db'
import ImageSquare from 'app/_modules/ImageSquare'

const RelatedImages = ({ jobId }: { jobId: string }) => {
  const [images, setImages] = useState([])

  const fetchImages = useCallback(async () => {
    if (!jobId) {
      return
    }

    const data = await fetchRelatedImages(jobId, 4)
    setImages(data)
  }, [jobId])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return (
    <div className="flex flex-row gap-2 mt-2">
      {images.length > 0 &&
        images.map((image, i) => {
          return (
            <ImageSquare
              // @ts-ignore
              key={`${image.jobId}_${i}`}
              imageDetails={image}
              size={80}
            />
          )
        })}
    </div>
  )
}

export default RelatedImages
