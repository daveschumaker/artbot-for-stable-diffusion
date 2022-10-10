// @ts-nocheck
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ImageDetails from '../../components/ImageDetails'
import ImageSquare from '../../components/ImageSquare'
import PageTitle from '../../components/PageTitle'

import Spinner from '../../components/Spinner'
import { fetchRelatedImages, getImageDetails } from '../../utils/db'

const ImagePage = () => {
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageDetails, setImageDetails] = useState({})
  const [relatedImages, setRelatedImages] = useState([])

  const fetchImageDetails = async (jobId: string) => {
    const data = await getImageDetails(jobId)
    setIsInitialLoad(false)
    setImageDetails(data)
    findRelatedImages(data.parentJobId)
  }

  const handleDeleteImageClick = async () => {
    router.push(`/images`)
  }

  const findRelatedImages = async (parentJobId = '') => {
    if (parentJobId) {
      const foundImages = await fetchRelatedImages(parentJobId)
      setRelatedImages(foundImages)
    }
  }

  useEffect(() => {
    if (id) {
      fetchImageDetails(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {!isInitialLoad && relatedImages.length > 1 && (
        <div className="border-0 border-t-2 border-dashed border-slate-500">
          <PageTitle>Related images</PageTitle>
          <div className="flex gap-y-2.5 flex-wrap gap-x-2.5">
            {relatedImages.map(
              (image: {
                jobId: string
                base64String: string
                prompt: string
                timestamp: number
                seed: number
              }) => {
                return (
                  <Link
                    href={`/image/${image.jobId}`}
                    key={image.jobId}
                    passHref
                  >
                    <a>
                      <ImageSquare imageDetails={image} />
                    </a>
                  </Link>
                )
              }
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImagePage
