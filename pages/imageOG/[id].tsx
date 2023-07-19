// @ts-nocheck
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import PageTitle from 'app/_components/PageTitle'
import Spinner from '../../components/Spinner'
import { getImageDetails, updateCompletedJob } from '../../utils/db'
import RelatedImages from '../../components/ImagePage/RelatedImages'
import { getRelatedImages } from '../../components/ImagePage/image.controller'
import ImageDetails from '../../components/ImageDetails'

const ImagePage = () => {
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageDetails, setImageDetails] = useState({})
  const [relatedImages, setRelatedImages] = useState([])
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const currentIndex = relatedImages.findIndex((el) => {
    return el.jobId === id
  })

  const findRelatedImages = useCallback(async (parentJobId = '') => {
    const result = await getRelatedImages(parentJobId)
    setRelatedImages(result)
  }, [])

  const fetchImageDetails = useCallback(async () => {
    const data = (await getImageDetails(id)) || {}
    setIsInitialLoad(false)
    setImageDetails(data)

    if (data?.base64String) {
      findRelatedImages(data.parentJobId)
    }
  }, [findRelatedImages, id])

  // const afterDeleteImageClick = async () => {
  //   router.push(`/images`)
  // }

  const handleFavoriteClick = useCallback(async () => {
    const newFavStatus = imageDetails.favorited ? false : true
    getImageDetails.delete(id) // bust memoization cache

    await updateCompletedJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        favorited: newFavStatus
      })
    )
    fetchImageDetails(id)
  }, [fetchImageDetails, id, imageDetails])

  const handleReloadImageData = useCallback(async () => {
    fetchImageDetails(id)
  }, [fetchImageDetails, id])

  useEffect(() => {
    if (id) {
      fetchImageDetails(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const maxLength = relatedImages.length

  const handleKeyPress = useCallback(
    (e: any, swipeDir) => {
      if (maxLength <= 1) {
        return
      }

      if (imageModalOpen) return

      if (e === null && swipeDir) {
        e = {}
        if (swipeDir === 'left') {
          e.key = 'ArrowLeft'
        } else if (swipeDir === 'right') {
          e.key = 'ArrowRight'
        }
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex !== 0 && relatedImages[currentIndex - 1]?.jobId) {
          router.replace(`/image/${relatedImages[currentIndex - 1].jobId}`)
        }
      } else if (e.key === 'ArrowRight') {
        if (
          currentIndex < maxLength - 1 &&
          relatedImages[currentIndex + 1]?.jobId
        ) {
          router.replace(`/image/${relatedImages[currentIndex + 1].jobId}`)
        }
      } else if (e.keyCode === 70) {
        handleFavoriteClick()
      }
    },
    [
      maxLength,
      imageModalOpen,
      currentIndex,
      router,
      relatedImages,
      handleFavoriteClick
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const noImageFound = !isInitialLoad && !imageDetails?.base64String

  return (
    <div className="pb-[88px]">
      <Head>
        <title>Image details - ArtBot for Stable Diffusion</title>
      </Head>
      <div className="flex flex-row w-full items-center mb-2">
        <div className="inline-block w-1/2">
          {!isInitialLoad && noImageFound ? (
            <PageTitle>Image not found</PageTitle>
          ) : (
            <PageTitle>
              Image details{' '}
              <div className="text-sm font-normal mt-[-4px]">
                {relatedImages.length > 1
                  ? `(${currentIndex + 1} / ${maxLength})`
                  : null}
              </div>
            </PageTitle>
          )}
        </div>
      </div>
      {isInitialLoad && <Spinner />}
      {!isInitialLoad && noImageFound && (
        <>
          <div>Oops!</div>
          <div className="mt-4">
            There is no image at this URL. Perhaps you&apos;ve bookmarked
            something that&apos;s been deleted. Or someone shared this link with
            you. All images are privately stored inside each user&apos;s
            browser.
          </div>
          <div className="mt-4 mb-2">
            <Link href="/" className="text-cyan-400">
              Why not create something new?
            </Link>
          </div>
        </>
      )}

      {!isInitialLoad && imageDetails?.base64String && (
        <>
          <ImageDetails
            handleReloadImageData={handleReloadImageData}
            imageDetails={imageDetails}
          />
        </>
      )}

      {!isInitialLoad && relatedImages.length > 1 && (
        <div className="pt-2 border-0 border-t-2 border-dashed border-slate-500">
          <RelatedImages
            onAfterDelete={() => findRelatedImages(imageDetails.parentJobId)}
            onModalOpen={setImageModalOpen}
            imageId={imageDetails.jobId}
            parentJobId={imageDetails.parentJobId}
            images={relatedImages}
            updateRelatedImages={() =>
              findRelatedImages(imageDetails.parentJobId)
            }
          />
        </div>
      )}
    </div>
  )
}

export default ImagePage
