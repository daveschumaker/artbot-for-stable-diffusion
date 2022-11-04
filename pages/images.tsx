/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Masonry from 'react-responsive-masonry'
import styled from 'styled-components'

import PageTitle from '../components/UI/PageTitle'
import Spinner from '../components/Spinner'
import { countCompletedJobs, fetchCompletedJobs, imageCount } from '../utils/db'
import LazyLoad from 'react-lazyload'
import ImageSquare from '../components/ImageSquare'
import { trackEvent } from '../api/telemetry'
import { Button } from '../components/UI/Button'
import { useWindowSize } from '../hooks/useWindowSize'
import ImageCard from '../components/ImagesPage/ImageCard/imageCard'
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon'

const MenuButton = styled.button`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  color: ${(props) => props.theme.navLinkActive};
  cursor: pointer;
  padding: 2px;
  position: relative;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    background-color: ${(props) => props.theme.navLinkActive};
    color: ${(props) => props.theme.body};
  }
`

const DropDownMenu = styled.div`
  background-color: ${(props) => props.theme.body};
  border: 2px solid ${(props) => props.theme.navLinkActive};
  border-radius: 4px;
  /* padding: 8px; */
  position: absolute;
  top: 0;
  width: 200px;
  right: -2px;
  top: 36px;
  z-index: 10;
`

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

const MenuItem = styled.li`
  cursor: pointer;
  padding: 4px 8px;
  width: 100%;

  &:hover {
    background-color: ${(props) => props.theme.navLinkActive};
    color: ${(props) => props.theme.body};
  }
`

const ImagesPage = () => {
  const size = useWindowSize()

  const [showMenu, setShowMenu] = useState(false)
  const [totalImages, setTotalImages] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [images, setImages] = useState([])
  const [showLayout, setShowLayout] = useState('layout')

  const fetchImages = useCallback(async (offset = 0) => {
    const sort = localStorage.getItem('imagePageSort') || 'new'
    const data = await fetchCompletedJobs({ offset, sort })
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
      if (btn === 'last') {
        const count = await countCompletedJobs()
        const sort = localStorage.getItem('imagePageSort') || 'new'
        const data = await fetchCompletedJobs({ offset: count - 100, sort })
        setImages(data)
        setOffset(count - 100)
        return
      }

      if (btn === 'first') {
        const sort = localStorage.getItem('imagePageSort') || 'new'
        const data = await fetchCompletedJobs({
          offset: 0,
          sort
        })
        setImages(data)
        setOffset(0)
        return
      }

      if (btn === 'prev') {
        newNum = offset - 100 < 0 ? 0 : offset - 100
      } else {
        newNum = offset + 100 > totalImages ? offset : offset + 100
      }

      trackEvent({
        event: 'LOAD_MORE_IMAGES_CLICK',
        context: 'ImagesPage',
        label: `${btn} - ${newNum}`
      })

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

  let defaultStyle = `flex gap-y-3 mt-4`

  if (showLayout === 'grid' || showLayout === 'layout') {
    defaultStyle += ` flex-wrap gap-x-3 justify-center md:justify-start`
  } else {
    defaultStyle += ` flex-col justify-center`
  }

  const currentOffset = offset + 1
  const maxOffset = offset + 100 > totalImages ? totalImages : offset + 100

  let imageColumns = 2
  // @ts-ignore
  if (size?.width > 1280) {
    imageColumns = 4
    // @ts-ignore
  } else if (size?.width > 800) {
    imageColumns = 3
  }

  return (
    <div>
      <Head>
        <title>ArtBot - Your images</title>
      </Head>
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          <PageTitle>Your images</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative">
          <MenuButton
            title="Change layout"
            onClick={() => {
              if (showMenu) {
                setShowMenu(false)
              } else {
                setShowMenu(true)
              }
            }}
          >
            <DotsVerticalIcon size={24} />
          </MenuButton>
          {showMenu && (
            <DropDownMenu>
              <ul>
                {/* <MenuItem>Select images...</MenuItem>
                <MenuSeparator /> */}
                <MenuItem
                  onClick={() => {
                    setShowMenu(false)
                    localStorage.setItem('showLayout', 'grid')
                    setShowLayout('grid')
                    trackEvent({
                      event: `MENU_CLICK`,
                      label: 'grid_view',
                      context: `ImagesPage`
                    })
                  }}
                >
                  Square Grid
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setShowMenu(false)
                    localStorage.setItem('showLayout', 'layout')
                    setShowLayout('layout')
                    trackEvent({
                      event: `MENU_CLICK`,
                      label: 'layout_view',
                      context: `ImagesPage`
                    })
                  }}
                >
                  Layout
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    setShowMenu(false)
                    localStorage.setItem('imagePageSort', 'new')
                    fetchImages()
                    trackEvent({
                      event: `MENU_CLICK`,
                      label: 'sort_new',
                      context: `ImagesPage`
                    })
                  }}
                >
                  Sort by Newest
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setShowMenu(false)
                    localStorage.setItem('imagePageSort', 'old')
                    fetchImages()
                    trackEvent({
                      event: `MENU_CLICK`,
                      label: 'sort_old',
                      context: `ImagesPage`
                    })
                  }}
                >
                  Sort by Oldest
                </MenuItem>
              </ul>
            </DropDownMenu>
          )}
        </div>
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
          <Link href="/" className="text-cyan-400">
            Why not create something?
          </Link>
        </div>
      )}
      <div className={defaultStyle}>
        {!isInitialLoad && images.length > 0 && showLayout === 'layout' && (
          <Masonry columnsCount={imageColumns} gutter="8px">
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
                      <img
                        src={'data:image/webp;base64,' + image.base64String}
                        style={{
                          borderRadius: '4px',
                          width: '100%',
                          display: 'block'
                        }}
                        alt={image.prompt}
                      />
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
                      <ImageSquare
                        imageDetails={image}
                        imageType={'image/webp'}
                      />
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
              height: number
              width: number
            }) => {
              return (
                <ImageCard
                  key={image.jobId}
                  imageDetails={image}
                  handleDeleteImageClick={handleDeleteImageClick}
                />
              )
            }
          )}
      </div>
      {!isInitialLoad && totalImages > 100 && (
        <div className="flex flex-row justify-center gap-2 mt-2">
          <Button
            disabled={offset === 0}
            onClick={() => handleLoadMore('first')}
            width="52px"
          >
            First
          </Button>
          <Button
            disabled={offset === 0}
            onClick={() => handleLoadMore('prev')}
            width="52px"
          >
            Prev
          </Button>
          <Button
            disabled={currentOffset >= totalImages - 99}
            onClick={() => handleLoadMore('next')}
            width="52px"
          >
            Next
          </Button>
          <Button
            disabled={currentOffset >= totalImages - 99}
            onClick={() => handleLoadMore('last')}
            width="52px"
          >
            Last
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImagesPage
