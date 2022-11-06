/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Masonry from 'react-responsive-masonry'
import LazyLoad from 'react-lazyload'
import styled from 'styled-components'

import PageTitle from '../components/UI/PageTitle'
import Spinner from '../components/Spinner'
import {
  bulkDeleteImages,
  countCompletedJobs,
  fetchCompletedJobs,
  filterCompletedJobs,
  imageCount
} from '../utils/db'
import ImageSquare from '../components/ImageSquare'
import { trackEvent } from '../api/telemetry'
import { Button } from '../components/UI/Button'
import { useWindowSize } from '../hooks/useWindowSize'
import ImageCard from '../components/ImagesPage/ImageCard/imageCard'
import DotsVerticalIcon from '../components/icons/DotsVerticalIcon'
import CircleCheckIcon from '../components/icons/CircleCheckIcon'
import TextButton from '../components/UI/TextButton'
import ConfirmationModal from '../components/ConfirmationModal'
import MenuButton from '../components/UI/MenuButton'
import FilterIcon from '../components/icons/FilterIcon'
import HeartIcon from '../components/icons/HeartIcon'

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

const NonLink = styled.div`
  cursor: pointer;
  position: relative;
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: gray;
  opacity: 0.6;
`

const SelectCheck = styled(CircleCheckIcon)`
  position: absolute;
  top: 8px;
  right: 8px;
`

const StyledHeartIcon = styled(HeartIcon)`
  position: absolute;
  top: 8px;
  left: 8px;
`

const ImagesPage = () => {
  const size = useWindowSize()

  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteSelection, setDeleteSelection] = useState<Array<string>>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [filterMode, setFilterMode] = useState('all')
  const [showMenu, setShowMenu] = useState(false)
  const [totalImages, setTotalImages] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [images, setImages] = useState([])
  const [showLayout, setShowLayout] = useState('layout')

  const fetchImages = useCallback(
    async (offset = 0) => {
      let data
      const sort = localStorage.getItem('imagePageSort') || 'new'

      if (filterMode === 'all') {
        data = await fetchCompletedJobs({ offset, sort })
      } else {
        data = await filterCompletedJobs({
          offset,
          sort,
          filterType: filterMode
        })
      }

      setImages(data)
      setIsInitialLoad(false)
    },
    [filterMode]
  )

  const handleDeleteImageClick = async () => {
    trackEvent({
      event: 'BULK_DELETE',
      numImages: deleteSelection.length,
      context: 'ImagesPage'
    })

    await bulkDeleteImages(deleteSelection)
    await getImageCount()
    await fetchImages()
    setDeleteSelection([])
    setDeleteMode(false)
    setShowDeleteModal(false)
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

  let defaultStyle = `flex gap-y-3 mt-4 relative`

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

  const handleImageClick = useCallback(
    (id: string) => {
      let newArray: Array<string> = [...deleteSelection]
      if (deleteMode) {
        const index = newArray.indexOf(id)
        if (index >= 0) {
          newArray.splice(index, 1)
        } else {
          newArray.push(id)
        }
      }

      setDeleteSelection(newArray)
    },
    [deleteMode, deleteSelection]
  )

  const handleSelectAll = () => {
    let delArray: Array<string> = []
    images.forEach((image: { id: string }) => {
      delArray.push(image.id)
    })

    setDeleteSelection(delArray)
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (deleteMode && e.keyCode === 27) {
        setDeleteSelection([])
        setDeleteMode(false)
        setShowDeleteModal(false)
      }

      if (deleteMode && e.keyCode === 13) {
        setShowDeleteModal(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [deleteMode])

  const LinkEl = deleteMode ? NonLink : Link

  return (
    <div>
      {showDeleteModal && (
        <ConfirmationModal
          multiImage={deleteSelection.length > 1}
          onConfirmClick={() => handleDeleteImageClick()}
          closeModal={() => {
            setDeleteSelection([])
            setDeleteMode(false)
            setShowDeleteModal(false)
          }}
        />
      )}
      <Head>
        <title>ArtBot - Your images</title>
      </Head>
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          <PageTitle>Your images</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <MenuButton
            active={deleteMode}
            title="Select Images"
            onClick={() => {
              if (deleteMode) {
                setDeleteSelection([])
                setDeleteMode(false)
              } else {
                setDeleteMode(true)
              }
            }}
          >
            <CircleCheckIcon size={24} />
          </MenuButton>
          <div className="relative">
            <MenuButton
              active={filterMode !== 'all'}
              title="Filter images"
              onClick={() => {
                if (showFilters) {
                  setShowFilters(false)
                } else {
                  setShowMenu(false)
                  setShowFilters(true)
                }
              }}
            >
              <FilterIcon />
            </MenuButton>
            {showFilters && (
              <DropDownMenu>
                <ul>
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('all')
                    }}
                  >
                    Show all images
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('favorited')
                    }}
                  >
                    Show favorited
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('unfavorited')
                    }}
                  >
                    Show unfavorited
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('text2img')
                    }}
                  >
                    Text-2-Img
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('img2img')
                    }}
                  >
                    Img-2-Img
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowFilters(false)
                      setFilterMode('inpainting')
                    }}
                  >
                    Inpainting
                  </MenuItem>
                </ul>
              </DropDownMenu>
            )}
          </div>
          <MenuButton
            active={showMenu}
            title="Change layout"
            onClick={() => {
              if (showMenu) {
                setShowMenu(false)
              } else {
                setShowFilters(false)
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
      <div className="flex flex-row w-full justify-between">
        {!deleteMode && totalImages > 0 && (
          <div className="text-sm mb-2 text-teal-500">
            Showing {currentOffset} - {maxOffset} of{' '}
            <strong>{totalImages}</strong> images
          </div>
        )}
        {deleteMode && (
          <>
            <div className="text-sm mb-2 text-teal-500">
              selected ({deleteSelection.length})
            </div>
            <div className="flex flex-row gap-2">
              <TextButton
                onClick={() => {
                  setDeleteSelection([])
                  setDeleteMode(false)
                }}
              >
                cancel
              </TextButton>
              <TextButton
                onClick={() => {
                  handleSelectAll()
                }}
              >
                select all
              </TextButton>
              <TextButton
                color="red"
                onClick={() => {
                  if (deleteSelection.length > 0) {
                    setShowDeleteModal(true)
                  }
                }}
              >
                delete
              </TextButton>
            </div>
          </>
        )}
      </div>
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
                id: string
                favorited: boolean
                jobId: string
                base64String: string
                prompt: string
                timestamp: number
                seed: number
              }) => {
                return (
                  <LazyLoad key={image.jobId} once>
                    <LinkEl
                      className="relative"
                      href={`/image/${image.jobId}`}
                      passHref
                      onClick={() => handleImageClick(image.id)}
                    >
                      <img
                        src={'data:image/webp;base64,' + image.base64String}
                        style={{
                          borderRadius: '4px',
                          width: '100%',
                          display: 'block'
                        }}
                        alt={image.prompt}
                      />
                      {deleteMode && deleteSelection.indexOf(image.id) >= 0 && (
                        <ImageOverlay></ImageOverlay>
                      )}
                      {deleteMode &&
                        deleteSelection.indexOf(image.id) === -1 && (
                          <SelectCheck />
                        )}
                      {deleteMode && deleteSelection.indexOf(image.id) >= 0 && (
                        <SelectCheck fill="blue" stroke="white" />
                      )}
                      {image.favorited && (
                        <StyledHeartIcon
                          fill="#14B8A6"
                          width="2"
                          size="32"
                          shadow
                        />
                      )}
                    </LinkEl>
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
                id: string
                jobId: string
                base64String: string
                prompt: string
                timestamp: number
                seed: number
              }) => {
                return (
                  <LazyLoad key={image.jobId} once>
                    <LinkEl
                      className="relative"
                      href={`/image/${image.jobId}`}
                      passHref
                      onClick={() => handleImageClick(image.id)}
                    >
                      <ImageSquare
                        imageDetails={image}
                        imageType={'image/webp'}
                      />
                      {deleteMode && deleteSelection.indexOf(image.id) >= 0 && (
                        <ImageOverlay></ImageOverlay>
                      )}
                      {deleteMode &&
                        deleteSelection.indexOf(image.id) === -1 && (
                          <SelectCheck />
                        )}
                      {deleteMode && deleteSelection.indexOf(image.id) >= 0 && (
                        <SelectCheck fill="blue" stroke="white" />
                      )}
                      {image.favorited && (
                        <StyledHeartIcon
                          fill="#14B8A6"
                          width="2"
                          size="32"
                          shadow
                        />
                      )}
                    </LinkEl>
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
        <div className="flex flex-row justify-center gap-2 mt-4">
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
