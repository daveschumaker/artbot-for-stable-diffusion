/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Masonry from 'react-responsive-masonry'

import ImageCardDetails from '../components/ImageCardDetails'
import PageTitle from '../components/PageTitle'
import Spinner from '../components/Spinner'
import { fetchCompletedJobs } from '../utils/db'
import LazyLoad from 'react-lazyload'
import GridIcon from '../components/icons/GridIcon'
import ListIcon from '../components/icons/ListIcon'
import LayoutIcon from '../components/icons/LayoutIcon'
import ImageSquare from '../components/ImageSquare'

const ImagesPage = () => {
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
  }, [showLayout])

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

    if (localStorage.getItem('showLayout')) {
      setShowLayout(localStorage.getItem('showLayout') || 'layout')
    }
  }, [])

  let defaultStyle = `flex justify-center gap-y-2.5`

  if (showLayout === 'grid' || showLayout === 'layout') {
    defaultStyle += ` flex-wrap gap-x-2.5`
  } else {
    defaultStyle += ` flex-col`
  }

  return (
    <div>
      <div className="inline-block w-1/2">
        <PageTitle>Your images</PageTitle>
      </div>
      <div className="inline-block w-1/2 text-right content-center">
        <button
          className="p-[2px] border-[1px] border-teal-500 rounded-md cursor-pointer text-sm text-teal-500 relative top-[3px]"
          onClick={handleGridListClick}
        >
          {showLayout === 'layout' && <LayoutIcon />}
          {showLayout === 'grid' && <GridIcon />}
          {showLayout === 'list' && <ListIcon />}
        </button>
      </div>
      <div className="mb-6 text-sm">
        <strong>Important:</strong> All images persist within your local browser
        cache and are not stored on a remote server. Clearing your cache will{' '}
        <strong>delete</strong> all images.
      </div>
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
                        <ImageSquare imageDetails={image} />
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
    </div>
  )
}

export default ImagesPage
