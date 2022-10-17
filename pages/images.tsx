/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Masonry from 'react-responsive-masonry'

import ImageCardDetails from '../components/ImageCardDetails'
import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { fetchCompletedJobs, imageCount } from '../utils/db'
import LazyLoad from 'react-lazyload'
import GridIcon from '../components/icons/GridIcon'
import ListIcon from '../components/icons/ListIcon'
import LayoutIcon from '../components/icons/LayoutIcon'
import ImageSquare from '../components/ImageSquare'
import { trackEvent } from '../api/telemetry'
import { Button } from '../components/Button'

const ImagesPage = () => {
  const [totalImages, setTotalImages] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [images, setImages] = useState([])
  const [showLayout, setShowLayout] = useState('layout')

  const handleGridListClick = useCallback(() => {
    if (showLayout === 'layout') {
      localStorage.setItem('showLayout', 'list')
      setShowLayout('list')
    } else if (showLayout === 'list') {
      localStorage.setItem('showLayout', 'grid')
      setShowLayout('grid')
    } else {
      localStorage.setItem('showLayout', 'layout')
      setShowLayout('layout')
    }

    trackEvent({
      event: `LAYOUT_CLICK`,
      label: showLayout,
      context: `ImagesPage`
    })
  }, [showLayout])

  const fetchImages = useCallback(async (offset = 0) => {
    const data = await fetchCompletedJobs({ offset })
    setImages(data)
    setIsInitialLoad(false)
  }, [])

  const handleDeleteImageClick = async () => {
    fetchImages()
  }

  const getImageCount = async () => {
    const count = await imageCount()
    setTotalImages(count)
  }

  const handleLoadMore = useCallback(
    async (btn: string) => {
      window.scrollTo(0, 0)
      let newNum
      if (btn === 'prev') {
        newNum = offset - 100 < 0 ? 0 : offset - 100
      } else {
        newNum = offset + 100 > totalImages ? offset : offset + 100
      }

      console.log(`offset?`, offset)
      console.log(`newNum`, newNum)

      await fetchImages(newNum)
      setOffset(newNum)
    },
    [fetchImages, offset, totalImages]
  )

  useEffect(() => {
    fetchImages()
    getImageCount()

    if (localStorage.getItem('showLayout')) {
      setShowLayout(localStorage.getItem('showLayout') || 'layout')
    }
  }, [fetchImages])

  let defaultStyle = `flex gap-y-2.5`

  if (showLayout === 'grid' || showLayout === 'layout') {
    defaultStyle += ` flex-wrap gap-x-2.5 justify-start`
  } else {
    defaultStyle += ` flex-col justify-center`
  }

  const currentOffset = offset + 1
  const maxOffset = offset + 100 > totalImages ? totalImages : offset + 100

  return (
    <div>
      <div className="inline-block w-1/2">
        <PageTitle>Your images</PageTitle>
      </div>
      <div className="inline-block w-1/2 text-right content-center">
        <button
          title="Change layout"
          className="p-[2px] border-[1px] border-teal-500 rounded-md cursor-pointer text-sm text-teal-500 relative top-[3px]"
          onClick={handleGridListClick}
        >
          {showLayout === 'layout' && <LayoutIcon />}
          {showLayout === 'grid' && <GridIcon />}
          {showLayout === 'list' && <ListIcon />}
        </button>
      </div>
      <div className="mb-2 text-sm">
        <strong>Important:</strong> All images persist within your local browser
        cache and are not stored on a remote server. Clearing your cache will{' '}
        <strong>delete</strong> all images.
      </div>
      {totalImages > 0 && (
        <div className="text-sm mb-2 text-teal-500">
          Showing {currentOffset} - {maxOffset} of{' '}
          <strong>{totalImages}</strong> images
        </div>
      )}
      {isInitialLoad && <Spinner />}
      {!isInitialLoad && images.length === 0 && (
        <div className="mb-2">
          You haven&apos;t created any images yet.{' '}
          <Link href="/">
            <a className="text-cyan-400">Why not create something?</a>
          </Link>
        </div>
      )}
      <div className={defaultStyle}>
        {!isInitialLoad && images.length > 0 && showLayout === 'layout' && (
          <Masonry columnsCount={2} gutter="8px">
            {images.map(
              (image: {
                jobId: string
                base64String: string
                prompt: string
                timestamp: number
                seed: number
              }) => {
                return (
                  <LazyLoad key={image.jobId} once>
                    <Link href={`/image/${image.jobId}`} passHref>
                      <a>
                        <img
                          src={'data:image/webp;base64,' + image.base64String}
                          style={{
                            borderRadius: '4px',
                            width: '100%',
                            display: 'block'
                          }}
                          alt={image.prompt}
                        />
                      </a>
                    </Link>
                  </LazyLoad>
                )
              }
            )}
          </Masonry>
        )}
        {!isInitialLoad && images.length > 0 && showLayout === 'grid' && (
          <>
            {images.map(
              (image: {
                jobId: string
                base64String: string
                prompt: string
                timestamp: number
                seed: number
              }) => {
                return (
                  <LazyLoad key={image.jobId} once>
                    <Link href={`/image/${image.jobId}`} passHref>
                      <a>
                        <ImageSquare
                          imageDetails={image}
                          imageType={'image/webp'}
                        />
                      </a>
                    </Link>
                  </LazyLoad>
                )
              }
            )}
          </>
        )}
        {!isInitialLoad &&
          images.length > 0 &&
          showLayout === 'list' &&
          images.map(
            (image: {
              jobId: string
              base64String: string
              prompt: string
              timestamp: number
              seed: number
            }) => {
              return (
                <LazyLoad key={image.jobId} once>
                  <div className="text-center border-[1px] border-solid border-slate-400 rounded-lg w-full mb-4 md:w-[512px] mx-auto">
                    <Link href={`/image/${image.jobId}`} passHref>
                      <a>
                        <div className="bg-slate-600 rounded-t-lg">
                          <img
                            src={'data:image/webp;base64,' + image.base64String}
                            className="mx-auto rounded-t-lg"
                            alt={image.prompt}
                          />
                        </div>
                      </a>
                    </Link>
                    <ImageCardDetails
                      imageDetails={image}
                      onDelete={handleDeleteImageClick}
                    />
                  </div>
                </LazyLoad>
              )
            }
          )}
      </div>
      {totalImages > 0 && (
        <div className="flex flex-row justify-center gap-2 mt-2">
          <Button
            disabled={offset === 0}
            onClick={() => handleLoadMore('prev')}
            width="52px"
          >
            Prev
          </Button>
          <Button
            disabled={currentOffset >= totalImages - 100}
            onClick={() => handleLoadMore('next')}
            width="52px"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImagesPage
