import { useCallback, useEffect, useState } from 'react'
import { fetchRelatedImages } from '../../utils/db'

const RelatedImages = ({ jobId }) => {
  const [images, setImages] = useState([])

  const fetchImages = useCallback(async () => {
    console.log(`parentJobId??`, jobId)
    const data = await fetchRelatedImages(jobId)

    console.log(`data??`, data)

    // setImages(data)
  }, [jobId])

  useEffect(() => {
    if (jobId) {
      fetchImages()
    }
  }, [fetchImages, jobId])

  return <div>hiii</div>
}

export default RelatedImages
