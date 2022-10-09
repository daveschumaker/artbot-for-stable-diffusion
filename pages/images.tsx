/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import ImageDetails from '../components/ImageDetails'
import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { fetchCompletedJobs } from '../utils/db'
import { setHasNewImage } from '../utils/imageCache'
import ImageSquare from '../components/ImageSquare'

const ImagesPage = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [images, setImages] = useState([])
  const [showGrid, setShowGrid] = useState(true)

  const handleGridListClick = useCallback(() => {
    if (showGrid) {
      localStorage.setItem('showGrid', 'false')
      setShowGrid(false)
    } else {
      localStorage.setItem('showGrid', 'true')
      setShowGrid(true)
    }
  }, [showGrid])

  const fetchImages = async () => {
    const data = await fetchCompletedJobs()
    setImages(data)
    setIsInitialLoad(false)
  }

  const handleDeleteImageClick = async () => {
    fetchImages()
  }

  useEffect(() => {
    fetchImages()
    setHasNewImage(false)

    if (localStorage.getItem('showGrid') === 'true') {
      setShowGrid(true)
    } else {
      setShowGrid(false)
    }
  }, [])

  let defaultStyle = `flex justify-center gap-y-2.5`

  if (showGrid) {
    defaultStyle += ` flex-wrap gap-x-2.5`
  } else {
    defaultStyle += ` flex-col`
  }

  return (
    <div>
      <div className="inline-block w-1/2">
        <PageTitle>Your images</PageTitle>
      </div>
      <div className="inline-block w-1/2 text-right">
        <div
          className="cursor-pointer text-sm text-blue-500"
          onClick={handleGridListClick}
        >
          {showGrid ? 'View: Grid' : 'View: List'}
        </div>
      </div>
      <div className="mt-2 mb-2 text-sm">
        <strong>Important:</strong> All images persist within your local browser
        cache and are not stored on a remote server.
        <br />
        Clearing your cache will <strong>delete</strong> all images.
      </div>
      {isInitialLoad && <Spinner />}
      {!isInitialLoad && images.length === 0 && (
        <div>
          You haven&apos;t created any images yet.{' '}
          <Link href="/">
            <a className="text-cyan-400">Why not create something?</a>
          </Link>
        </div>
      )}
      <div className={defaultStyle}>
        {!isInitialLoad &&
          images.length > 0 &&
          showGrid &&
          images.map(
            (image: {
              jobId: string
              base64String: string
              prompt: string
              timestamp: number
              seed: number
            }) => {
              return (
                <Link href={`/image/${image.jobId}`} key={image.jobId} passHref>
                  <a>
                    <ImageSquare imageDetails={image} />
                  </a>
                </Link>
              )
            }
          )}
        {!isInitialLoad &&
          images.length > 0 &&
          !showGrid &&
          images.map(
            (image: {
              jobId: string
              base64String: string
              prompt: string
              timestamp: number
              seed: number
            }) => {
              return (
                <div
                  key={image.jobId}
                  className="text-center border-0 border-b-2 border-dashed border-slate-500 pt-6 pb-6"
                >
                  <img
                    src={'data:image/webp;base64,' + image.base64String}
                    className="mx-auto"
                    alt={image.prompt}
                  />
                  <ImageDetails
                    imageDetails={image}
                    onDelete={handleDeleteImageClick}
                  />
                </div>
              )
            }
          )}
      </div>
    </div>
  )
}

export default ImagesPage
