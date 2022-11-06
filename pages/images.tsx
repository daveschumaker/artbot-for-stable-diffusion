/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import React, { useCallback, useEffect } from 'react'
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
import useComponentState from '../hooks/useComponentState'

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
  bottom: 8px;
  right: 8px;
`

const StyledHeartIcon = styled(HeartIcon)`
  position: absolute;
  top: 8px;
  right: 8px;
`

const ImagesPage = () => {
  const size = useWindowSize()

  const [componentState, setComponentState] = useComponentState({
    deleteMode: false,
    deleteSelection: [],
    showDeleteModal: false,

    offset: 0,
    filterMode: 'all',
    layoutMode: 'layout',
    sortMode: 'new',
    showFilterMenu: false,
    showLayoutMenu: false,
    totalImages: 0,
    images: [],
    isLoading: true
  })

  const fetchImages = useCallback(
    async (offset = 0) => {
      let data
      const sort = localStorage.getItem('imagePageSort') || 'new'

      if (componentState.filterMode === 'all') {
        data = await fetchCompletedJobs({ offset, sort })
      } else {
        data = await filterCompletedJobs({
          offset,
          sort,
          filterType: componentState.filterMode
        })
      }

      setComponentState({ images: data, isLoading: false })
    },
    [componentState.filterMode, setComponentState]
  )

  const handleDeleteImageClick = async () => {
    trackEvent({
      event: 'BULK_DELETE',
      numImages: componentState.deleteSelection.length,
      context: 'ImagesPage'
    })

    await bulkDeleteImages(componentState.deleteSelection)
    await getImageCount()
    await fetchImages()
    setComponentState({
      deleteMode: false,
      deleteSelection: [],
      showDeleteModal: false
    })
  }

  const getImageCount = async () => {
    const count = await imageCount()
    setComponentState({ totalImages: count })
  }

  const handleLoadMore = useCallback(
    async (btn: string) => {
      setComponentState({
        isLoading: true
      })
      window.scrollTo(0, 0)
      let newNum
      if (btn === 'last') {
        const count = await countCompletedJobs()
        const sort = localStorage.getItem('imagePageSort') || 'new'
        const data = await fetchCompletedJobs({ offset: count - 100, sort })
        setComponentState({
          images: data,
          isLoading: false,
          offset: count - 100
        })
        return
      }

      if (btn === 'first') {
        const sort = localStorage.getItem('imagePageSort') || 'new'
        const data = await fetchCompletedJobs({
          offset: 0,
          sort
        })
        setComponentState({
          images: data,
          isLoading: false,
          offset: 0
        })
        return
      }

      if (btn === 'prev') {
        newNum =
          componentState.offset - 100 < 0 ? 0 : componentState.offset - 100
      } else {
        newNum =
          componentState.offset + 100 > componentState.totalImages
            ? componentState.offset
            : componentState.offset + 100
      }

      trackEvent({
        event: 'LOAD_MORE_IMAGES_CLICK',
        context: 'ImagesPage',
        label: `${btn} - ${newNum}`
      })

      await fetchImages(newNum)
      setComponentState({ offset: newNum })
    },
    [
      fetchImages,
      componentState.offset,
      componentState.totalImages,
      setComponentState
    ]
  )

  useEffect(() => {
    fetchImages()
    getImageCount()

    if (localStorage.getItem('showLayout')) {
      setComponentState({
        layoutMode: localStorage.getItem('showLayout') || 'layout'
      })
    }
  }, [fetchImages, setComponentState])

  let defaultStyle = `flex gap-y-3 mt-4 relative`

  if (
    componentState.layoutMode === 'grid' ||
    componentState.layoutMode === 'layout'
  ) {
    defaultStyle += ` flex-wrap gap-x-3 justify-center md:justify-start`
  } else {
    defaultStyle += ` flex-col justify-center`
  }

  const currentOffset = componentState.offset + 1
  const maxOffset =
    componentState.offset + 100 > componentState.totalImages
      ? componentState.totalImages
      : componentState.offset + 100

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
      let newArray: Array<string> = [...componentState.deleteSelection]
      if (componentState.deleteMode) {
        const index = newArray.indexOf(id)
        if (index >= 0) {
          newArray.splice(index, 1)
        } else {
          newArray.push(id)
        }
      }

      setComponentState({ deleteSelection: newArray })
    },
    [
      componentState.deleteMode,
      componentState.deleteSelection,
      setComponentState
    ]
  )

  const handleSelectAll = () => {
    let delArray: Array<string> = []
    componentState.images.forEach((image: { id: string }) => {
      delArray.push(image.id)
    })

    setComponentState({ deleteSelection: delArray })
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (componentState.deleteMode && e.keyCode === 27) {
        setComponentState({
          deleteMode: false,
          deleteSelection: [],
          showDeleteModal: false
        })
      }

      if (componentState.deleteMode && e.keyCode === 13) {
        setComponentState({ showDeleteModal: true })
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [componentState.deleteMode, setComponentState])

  const LinkEl = componentState.deleteMode ? NonLink : Link

  return (
    <div>
      {componentState.showDeleteModal && (
        <ConfirmationModal
          multiImage={componentState.deleteSelection.length > 1}
          onConfirmClick={() => handleDeleteImageClick()}
          closeModal={() => {
            setComponentState({
              deleteMode: false,
              deleteSelection: [],
              showDeleteModal: false
            })
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
            active={componentState.deleteMode}
            title="Select Images"
            onClick={() => {
              if (componentState.deleteMode) {
                setComponentState({ deleteMode: false, deleteSelection: [] })
              } else {
                setComponentState({ deleteMode: true })
              }
            }}
          >
            <CircleCheckIcon size={24} />
          </MenuButton>
          <div className="relative">
            <MenuButton
              active={componentState.filterMode !== 'all'}
              title="Filter images"
              onClick={() => {
                if (componentState.showFilterMenu) {
                  setComponentState({ showFilterMenu: false })
                } else {
                  setComponentState({
                    showFilterMenu: true,
                    showLayoutMenu: false
                  })
                }
              }}
            >
              <FilterIcon />
            </MenuButton>
            {componentState.showFilterMenu && (
              <DropDownMenu>
                <ul>
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'all',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Show all images
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'favorited',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Show favorited
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'unfavorited',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Show unfavorited
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'text2img',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Text-2-Img
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'img2img',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Img-2-Img
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setComponentState({
                        filterMode: 'inpainting',
                        isLoading: true,
                        showFilterMenu: false
                      })
                    }}
                  >
                    Inpainting
                  </MenuItem>
                </ul>
              </DropDownMenu>
            )}
          </div>
          <MenuButton
            active={componentState.showLayoutMenu}
            title="Change layout"
            onClick={() => {
              if (componentState.showLayoutMenu) {
                setComponentState({
                  showLayoutMenu: false
                })
              } else {
                setComponentState({
                  showFilterMenu: false,
                  showLayoutMenu: true
                })
              }
            }}
          >
            <DotsVerticalIcon size={24} />
          </MenuButton>
          {componentState.showLayoutMenu && (
            <DropDownMenu>
              <ul>
                {/* <MenuItem>Select images...</MenuItem>
                <MenuSeparator /> */}
                <MenuItem
                  onClick={() => {
                    setComponentState({
                      layoutMode: 'grid',
                      showLayoutMenu: false
                    })
                    localStorage.setItem('showLayout', 'grid')
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
                    setComponentState({
                      layoutMode: 'layout',
                      showLayoutMenu: false
                    })
                    localStorage.setItem('showLayout', 'layout')
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
                    setComponentState({
                      isLoading: true,
                      showLayoutMenu: false
                    })
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
                    setComponentState({
                      isLoading: true,
                      showLayoutMenu: false
                    })
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
        {!componentState.deleteMode && componentState.totalImages > 0 && (
          <div className="text-sm mb-2 text-teal-500">
            Showing {currentOffset} - {maxOffset} of{' '}
            <strong>{componentState.totalImages}</strong> images
          </div>
        )}
        {componentState.deleteMode && (
          <>
            <div className="text-sm mb-2 text-teal-500">
              selected ({componentState.deleteSelection.length})
            </div>
            <div className="flex flex-row gap-2">
              <TextButton
                onClick={() => {
                  setComponentState({ deleteMode: false, deleteSelection: [] })
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
                  if (componentState.deleteSelection.length > 0) {
                    setComponentState({ showDeleteModal: true })
                  }
                }}
              >
                delete
              </TextButton>
            </div>
          </>
        )}
      </div>
      {componentState.isLoading && <Spinner />}
      {!componentState.isLoading && componentState.images.length === 0 && (
        <div className="mb-2">
          You haven&apos;t created any images yet.{' '}
          <Link href="/" className="text-cyan-400">
            Why not create something?
          </Link>
        </div>
      )}
      <div className={defaultStyle}>
        {!componentState.isLoading &&
          componentState.images.length > 0 &&
          componentState.layoutMode === 'layout' && (
            <Masonry columnsCount={imageColumns} gutter="8px">
              {componentState.images.map(
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
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) >=
                            0 && <ImageOverlay></ImageOverlay>}
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) ===
                            -1 && <SelectCheck />}
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) >=
                            0 && <SelectCheck fill="blue" stroke="white" />}
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
        {!componentState.isLoading &&
          componentState.images.length > 0 &&
          componentState.layoutMode === 'grid' && (
            <>
              {componentState.images.map(
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
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) >=
                            0 && <ImageOverlay></ImageOverlay>}
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) ===
                            -1 && <SelectCheck />}
                        {componentState.deleteMode &&
                          componentState.deleteSelection.indexOf(image.id) >=
                            0 && <SelectCheck fill="blue" stroke="white" />}
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
        {!componentState.isLoading &&
          componentState.images.length > 0 &&
          componentState.layoutMode === 'list' &&
          componentState.images.map(
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
      {!componentState.isLoading && componentState.totalImages > 100 && (
        <div className="flex flex-row justify-center gap-2 mt-4">
          <Button
            disabled={componentState.offset === 0}
            onClick={() => handleLoadMore('first')}
            width="52px"
          >
            First
          </Button>
          <Button
            disabled={componentState.offset === 0}
            onClick={() => handleLoadMore('prev')}
            width="52px"
          >
            Prev
          </Button>
          <Button
            disabled={currentOffset >= componentState.totalImages - 99}
            onClick={() => handleLoadMore('next')}
            width="52px"
          >
            Next
          </Button>
          <Button
            disabled={currentOffset >= componentState.totalImages - 99}
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
