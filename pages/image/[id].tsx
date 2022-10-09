// @ts-nocheck
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ImageDetails from '../../components/ImageDetails'

import Spinner from '../../components/Spinner'
import { getImageDetails } from '../../utils/db'

const ImagePage = () => {
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageDetails, setImageDetails] = useState({})

  const fetchImageDetails = async (jobId: string) => {
    const data = await getImageDetails(jobId)
    setIsInitialLoad(false)
    setImageDetails(data)
  }

  const handleDeleteImageClick = async () => {
    router.push(`/images`)
  }

  useEffect(() => {
    if (id) {
      fetchImageDetails(id)
    }
  }, [id])

  return (
    <div>
      {isInitialLoad && <Spinner />}
      {!isInitialLoad && imageDetails?.base64String && (
        <div key={imageDetails.jobId} className="text-center pt-6 pb-6">
          <img
            src={'data:image/webp;base64,' + imageDetails.base64String}
            className="mx-auto"
            alt={imageDetails.prompt}
          />
          <ImageDetails
            imageDetails={imageDetails}
            onDelete={handleDeleteImageClick}
          />
        </div>
      )}
    </div>
  )
}

export default ImagePage
