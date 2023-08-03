'use client'

/* eslint-disable @next/next/no-img-element */
import { useSwipeable } from 'react-swipeable'
import Head from 'next/head'
import React, { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LazyLoad from 'react-lazyload'
import styled from 'styled-components'

import useGalleryImageModal from 'app/_pages/ImagesPage/useGalleryImageModal'

import PageTitle from 'app/_components/PageTitle'
import Spinner from 'components/Spinner'
import {
  bulkDeleteImages,
  countCompletedJobs,
  countFilterCompleted,
  fetchCompletedJobs,
  filterCompletedJobs,
  imageCount
} from 'utils/db'
import ImageSquare from 'components/ImageSquare'
import { trackEvent } from 'api/telemetry'
import { Button } from 'components/UI/Button'
import { useWindowSize } from 'hooks/useWindowSize'
import DotsVerticalIcon from 'components/icons/DotsVerticalIcon'
import CircleCheckIcon from 'components/icons/CircleCheckIcon'
import TextButton from 'components/UI/TextButton'
import ConfirmationModal from 'components/ConfirmationModal'
import MenuButton from 'app/_components/MenuButton'
import FilterIcon from 'components/icons/FilterIcon'
import HeartIcon from 'components/icons/HeartIcon'
import useComponentState from 'hooks/useComponentState'
import { downloadImages } from 'utils/imageUtils'
import { useEffectOnce } from 'hooks/useEffectOnce'
import MasonryLayout from 'components/MasonryLayout'
import Modal from 'components/Modal'
import DropDownMenu from 'components/UI/DropDownMenu'
import DropDownMenuItem from 'components/UI/DropDownMenuItem'
import AppSettings from 'models/AppSettings'
import AdContainer from 'components/AdContainer'
import { setFilteredItemsArray } from 'store/filteredImagesCache'
import FloatingActionButton from 'components/UI/FloatingActionButton'
import TrashIcon from 'components/icons/TrashIcon'
import { useStore } from 'statery'
import { appInfoStore } from 'store/appStore'
import TooltipComponent from 'app/_components/TooltipComponent'
import isMobile from 'is-mobile'
import { parseQueryString } from 'utils/appUtils'
import { useModal } from '@ebay/nice-modal-react'

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
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
  bottom: 4px;
  right: 4px;
`

const StyledHeartIcon = styled(HeartIcon)`
  position: absolute;
  top: 4px;
  right: 4px;
`

const ButtonContainer = styled.div`
  column-gap: 8px;
  display: flex;
  flex-direction: row;
  row-gap: 4px;
  max-width: 240px;
  flex-wrap: wrap;
  justify-content: end;

  @media (min-width: 640px) {
    max-width: 100%;
  }
`

const ImagesPage = () => {
  const { adHidden } = useStore(appInfoStore)
  const confirmationModal = useModal(ConfirmationModal)
  const LIMIT = AppSettings.get('imagesPerPage') || 50

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (AppSettings.get('enableGallerySwipe') === false) {
        return
      }

      if (componentState.offset >= componentState.totalImages - (LIMIT - 1))
        return

      if (isImageModalOpen) return
      handleLoadMore('next')
    },
    onSwipedRight: () => {
      if (AppSettings.get('enableGallerySwipe') === false) {
        return
      }

      if (componentState.offset <= 0) return

      if (isImageModalOpen) return
      handleLoadMore('prev')
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 35
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const size = useWindowSize()
  const appState = useStore(appInfoStore)
  const { imageDetailsModalOpen } = appState

  const [componentState, setComponentState] = useComponentState({
    deleteMode: false,
    deleteSelection: [],
    showDownloadModal: false,

    offset: Number(searchParams?.get('offset')) || 0,
    filterMode: searchParams?.get('filter') || 'all',
    layoutMode: 'layout',
    sortMode: searchParams?.get('sort') || 'new',
    showFilterMenu: false,
    showLayoutMenu: false,
    totalImages: 0,
    images: [],
    isLoading: true,
    updateTimestamp: Date.now(),

    currentFilterImageIndex: 0,
    rawTotalImages: 0
  })

  const getImageCount = useCallback(async () => {
    let count
    const rawTotal = await imageCount()

    if (componentState.filterMode !== 'all') {
      count = await countFilterCompleted({
        filterType: componentState.filterMode,
        model: searchParams?.get('model') as string
      })
    } else {
      count = rawTotal
    }
    setComponentState({ totalImages: count, rawTotalImages: rawTotal })
  }, [componentState.filterMode, searchParams, setComponentState])

  const fetchImages = useCallback(async () => {
    // This is a hack to get around linting error with dependency array.
    // After an image is deleted, force update a timestamp. useCallback here
    // sees that it was updated and reruns the fetch query.
    if (!componentState.updateTimestamp) {
      return
    }

    const offset = Number(searchParams?.get('offset')) || 0
    let data
    const sort = localStorage.getItem('imagePageSort') || 'new'

    if (componentState.filterMode === 'all') {
      data = await fetchCompletedJobs({ limit: LIMIT, offset, sort })
    } else {
      data = await filterCompletedJobs({
        limit: LIMIT,
        offset,
        sort,
        filterType: componentState.filterMode,
        model: searchParams?.get('model') as string,
        callback: (i) => setComponentState({ currentFilterImageIndex: i })
      })
      setFilteredItemsArray(data)
    }
    await getImageCount()
    setComponentState({ images: data, isLoading: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    LIMIT,
    componentState.filterMode,
    componentState.updateTimestamp,
    getImageCount,
    searchParams,
    setComponentState
  ])

  const [showImageModal, isImageModalOpen] = useGalleryImageModal({
    fetchImages
  })

  // const fetchImages = useCallback(async () => {
  //   console.log(`OH FETCHY!`)
  //   // This is a hack to get around linting error with dependency array.
  //   // After an image is deleted, force update a timestamp. useCallback here
  //   // sees that it was updated and reruns the fetch query.
  //   if (!componentState.updateTimestamp) {
  //     return
  //   }

  //   const offset = Number(searchParams?.get('offset')) || 0
  //   let data
  //   const sort = localStorage.getItem('imagePageSort') || 'new'

  //   if (componentState.filterMode === 'all') {
  //     data = await fetchCompletedJobs({ limit: LIMIT, offset, sort })
  //   } else {
  //     data = await filterCompletedJobs({
  //       limit: LIMIT,
  //       offset,
  //       sort,
  //       filterType: componentState.filterMode,
  //       model: searchParams?.get('model') as string,
  //       callback: (i) => setComponentState({ currentFilterImageIndex: i })
  //     })
  //     setFilteredItemsArray(data)
  //   }
  //   await getImageCount()
  //   setComponentState({ images: data, isLoading: false })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   forceFetchRef.current, // Required dep in order to force function call
  //   LIMIT,
  //   componentState.filterMode,
  //   componentState.updateTimestamp,
  //   getImageCount,
  //   searchParams,
  //   setComponentState
  // ])

  const handleDeleteImageClick = useCallback(async () => {
    await bulkDeleteImages(componentState.deleteSelection)
    await getImageCount()
    await fetchImages()
    setComponentState({
      deleteMode: false,
      deleteSelection: [],
      updateTimestamp: Date.now()
    })
    confirmationModal.remove()
  }, [
    componentState.deleteSelection,
    confirmationModal,
    fetchImages,
    getImageCount,
    setComponentState
  ])

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
        const data = await fetchCompletedJobs({
          limit: LIMIT,
          offset: count - LIMIT,
          sort
        })
        setComponentState({
          images: data,
          isLoading: false,
          offset: count - LIMIT
        })

        const newQuery = Object.assign(
          {},
          parseQueryString(window?.location?.search)
        )
        newQuery.offset = String(count - LIMIT)
        //@ts-ignore
        router.push(`?${new URLSearchParams(newQuery).toString()}`)
        return
      }

      if (btn === 'first') {
        const sort = localStorage.getItem('imagePageSort') || 'new'
        const data = await fetchCompletedJobs({
          limit: LIMIT,
          offset: 0,
          sort
        })
        setComponentState({
          images: data,
          isLoading: false,
          offset: 0
        })

        const newQuery = Object.assign(
          {},
          parseQueryString(window?.location?.search)
        )
        delete newQuery.offset
        //@ts-ignore
        router.push(`?${new URLSearchParams(newQuery).toString()}`)
        return
      }

      if (btn === 'prev') {
        if (isImageModalOpen) return
        newNum =
          componentState.offset - LIMIT < 0 ? 0 : componentState.offset - LIMIT
      } else {
        if (isImageModalOpen) return
        newNum =
          componentState.offset + LIMIT > componentState.totalImages
            ? componentState.offset
            : componentState.offset + LIMIT
      }

      trackEvent({
        event: 'LOAD_MORE_IMAGES_CLICK',
        context: '/pages/images',
        data: {
          range: `${btn} - ${newNum}`
        }
      })

      //await fetchImages(newNum)
      setComponentState({ offset: newNum })

      const newQuery = Object.assign(
        {},
        parseQueryString(window?.location?.search)
      )
      newQuery.offset = newNum
      //@ts-ignore
      router.push(`?${new URLSearchParams(newQuery).toString()}`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [componentState.offset, componentState.totalImages, setComponentState]
  )

  useEffect(() => {
    fetchImages()
    getImageCount()

    if (localStorage.getItem('showLayout')) {
      setComponentState({
        layoutMode: localStorage.getItem('showLayout') || 'layout'
      })
    }
  }, [fetchImages, getImageCount, setComponentState])

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
    componentState.offset + LIMIT > componentState.totalImages
      ? componentState.totalImages
      : componentState.offset + LIMIT

  let imageColumns = 2
  // @ts-ignore
  if (size?.width > 1280) {
    imageColumns = 4
    // @ts-ignore
  } else if (size?.width > 800) {
    imageColumns = 3
  }

  const handleImageClick = useCallback(
    (e: any, id: string, jobId: string) => {
      let newArray: Array<string> = [...componentState.deleteSelection]
      if (componentState.deleteMode) {
        const index = newArray.indexOf(id)
        if (index >= 0) {
          newArray.splice(index, 1)
        } else {
          newArray.push(id)
        }

        setComponentState({ deleteSelection: newArray })
      } else {
        e.preventDefault()
        e.stopPropagation()

        // @ts-ignore
        showImageModal({
          images: componentState.images,
          jobId,
          handleDeleteImageClick: () => console.log('DICK BUTT')
        })
      }
    },
    [
      componentState.deleteMode,
      componentState.deleteSelection,
      componentState.images,
      setComponentState,
      showImageModal
    ]
  )

  const handleDownloadClick = async () => {
    if (componentState.deleteSelection.length === 0) {
      return
    }

    setComponentState({ showDownloadModal: true })

    const imagesToDownload: Array<any> = []

    componentState.deleteSelection.forEach((id: number) => {
      componentState.images.filter(async (image: any) => {
        if (image.id === id) {
          imagesToDownload.push(image)
        }
      })
    })

    await downloadImages({ imageArray: imagesToDownload })

    setComponentState({ showDownloadModal: false })
    trackEvent({
      event: 'BULK_FILE_DOWNLOAD',
      context: '/pages/images',
      data: {
        numImages: componentState.deleteSelection.length
      }
    })

    setComponentState({
      deleteMode: false,
      deleteSelection: []
    })
  }

  const handleSelectAll = () => {
    let delArray: Array<string> = [...componentState.deleteSelection]

    componentState.images.forEach((image: { id: string }) => {
      if (delArray.indexOf(image.id) === -1) {
        delArray.push(image.id)
      }
    })

    setComponentState({
      deleteSelection: delArray
    })
  }

  const handleFilterButtonClick = useCallback(() => {
    if (componentState.showFilterMenu) {
      setComponentState({ showFilterMenu: false })
    } else {
      setComponentState({
        showFilterMenu: true,
        showLayoutMenu: false
      })
    }
  }, [componentState.showFilterMenu, setComponentState])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (componentState.deleteMode && e.key === 'Escape') {
        setComponentState({
          deleteMode: false,
          deleteSelection: []
        })
        confirmationModal.remove()
      }

      if (componentState.deleteMode && e.keyCode === 13) {
        confirmationModal.show({
          multiImage: componentState.deleteSelection.length > 1,
          onConfirmClick: handleDeleteImageClick,
          closeModal: () => {
            setComponentState({
              deleteMode: false,
              deleteSelection: []
            })
          }
        })
      } else if (e.key === 'ArrowLeft' && isImageModalOpen === false) {
        if (isImageModalOpen || currentOffset <= 1) return
        handleLoadMore('prev')
      } else if (e.key === 'ArrowRight' && isImageModalOpen === false) {
        const onLastPage =
          componentState.offset >= componentState.totalImages - LIMIT - 1
        if (onLastPage) return
        if (isImageModalOpen) return
        handleLoadMore('next')
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    LIMIT,
    componentState.deleteMode,
    componentState.deleteSelection.length,
    componentState.offset,
    componentState.totalImages,
    confirmationModal,
    currentOffset,
    handleDeleteImageClick,
    handleLoadMore,
    isImageModalOpen,
    setComponentState
  ])

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/images'
    })
  })

  useEffect(() => {
    if (localStorage.getItem('imagePageSort') === 'old') {
      setComponentState({ sortMode: 'old' })
    } else {
      setComponentState({ sortMode: 'new' })
    }
  }, [setComponentState])

  useEffect(() => {
    const updateObject = {
      isLoading: true
    }

    // @ts-ignore
    if (searchParams?.get('model')) updateObject.filterMode = 'model'
    if (searchParams?.get('filter'))
      // @ts-ignore
      updateObject.filterMode = searchParams?.get('filter')
    if (searchParams?.get('offset'))
      // @ts-ignore
      updateObject.offset = Number(searchParams?.get('offset'))
    //@ts-ignore
    if (!searchParams?.get('offset')) updateObject.offset = 0
    if (searchParams?.get('sort'))
      // @ts-ignore
      updateObject.sortMode = searchParams?.get('sort')

    setComponentState(updateObject)
  }, [searchParams, setComponentState])

  const LinkEl = componentState.deleteMode ? NonLink : Link

  const countDescriptor = () => {
    const descriptorMap = {
      model: `"${searchParams?.get('model') || ''}" `,
      favorited: 'favorite ',
      unfavorited: 'unfavorited ',
      text2img: 'text2img ',
      img2img: 'img2img ',
      inpainting: 'inpainted '
    }

    return descriptorMap[
      componentState.filterMode as keyof typeof descriptorMap
    ]
  }

  return (
    <div className="relative pb-[88px]" {...handlers}>
      {componentState.deleteMode && (
        <FloatingActionButton
          onClick={() => {
            if (componentState.deleteSelection.length > 0) {
              confirmationModal.show({
                multiImage: componentState.deleteSelection.length > 1,
                onConfirmClick: handleDeleteImageClick,
                closeModal: () => {
                  setComponentState({
                    deleteMode: false,
                    deleteSelection: []
                  })
                }
              })
            }
          }}
        >
          <TrashIcon />
          DELETE
          {componentState.deleteSelection.length > 0
            ? ` (${componentState.deleteSelection.length})?`
            : '?'}
        </FloatingActionButton>
      )}
      {componentState.showDownloadModal && (
        <Modal visible={true}>
          <>
            Downloading images
            <div className="flex flex-row w-full mt-4 mb-4 text-sm">
              Processing selected images for download and converting to{' '}
              {AppSettings.get('imageDownloadFormat') || 'JPG'}s. Please wait.
            </div>
            <div className="flex flex-row justify-center w-full">
              <Spinner />
            </div>
          </>
        </Modal>
      )}
      <Head>
        <title>Your images - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Your images" />
      </Head>
      <div className="flex flex-row items-center w-full">
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
                setComponentState({
                  deleteMode: true,
                  showFilterMenu: false,
                  showLayoutMenu: false
                })
              }
            }}
          >
            <CircleCheckIcon size={24} />
          </MenuButton>
          <div className="relative">
            <MenuButton
              active={componentState.showFilterMenu}
              title="Filter images"
              onClick={handleFilterButtonClick}
            >
              <FilterIcon />
            </MenuButton>
            {componentState.showFilterMenu && (
              <DropDownMenu
                handleClose={() => {
                  setComponentState({
                    showFilterMenu: false
                  })
                }}
              >
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'all',
                      isLoading: componentState.filterMode !== 'all'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    delete newQuery.filter
                    delete newQuery.model
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  Show all images
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'favorited',
                      isLoading: componentState.filterMode !== 'favorited'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'favorited'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  Show favorited
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'unfavorited',
                      isLoading: componentState.filterMode !== 'unfavorited'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'unfavorited'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  Show unfavorited
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'upscaled',
                      isLoading: componentState.filterMode !== 'upscaled'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'upscaled'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  Show upscaled
                </DropDownMenuItem>
                <MenuSeparator />
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'text2img',
                      isLoading: componentState.filterMode !== 'text2img'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'text2img'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  text2img
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'img2img',
                      isLoading: componentState.filterMode !== 'img2img'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'img2img'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  img2img
                </DropDownMenuItem>
                <DropDownMenuItem
                  onClick={() => {
                    setComponentState({
                      filterMode: 'inpainting',
                      isLoading: componentState.filterMode !== 'inpainting'
                    })

                    const newQuery = Object.assign(
                      {},
                      parseQueryString(window?.location?.search)
                    )
                    newQuery.filter = 'inpainting'
                    router.push(
                      //@ts-ignore
                      `?${new URLSearchParams(newQuery).toString()}`
                    )
                  }}
                >
                  inpainting
                </DropDownMenuItem>
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
            <DropDownMenu
              handleClose={() => {
                setComponentState({ showLayoutMenu: false })
              }}
            >
              {/* <MenuItem>Select images...</MenuItem>
                <MenuSeparator /> */}
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    layoutMode: 'grid'
                  })
                  localStorage.setItem('showLayout', 'grid')
                  trackEvent({
                    event: `MENU_CLICK`,
                    action: 'grid_view',
                    context: '/pages/images'
                  })
                }}
              >
                Square Grid
              </DropDownMenuItem>
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    layoutMode: 'layout'
                  })
                  localStorage.setItem('showLayout', 'layout')
                  trackEvent({
                    event: `MENU_CLICK`,
                    action: 'layout_view',
                    context: '/pages/images'
                  })
                }}
              >
                Dynamic Layout
              </DropDownMenuItem>
              <MenuSeparator />
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    isLoading: true,
                    sortMode: 'new'
                  })
                  localStorage.setItem('imagePageSort', 'new')
                  fetchImages()

                  const newQuery = Object.assign(
                    {},
                    parseQueryString(window?.location?.search)
                  )
                  delete newQuery.sort
                  //@ts-ignore
                  router.push(`?${new URLSearchParams(newQuery).toString()}`)

                  trackEvent({
                    event: `MENU_CLICK`,
                    action: 'sort_new',
                    context: '/pages/images'
                  })
                }}
              >
                Sort by Newest
              </DropDownMenuItem>
              <DropDownMenuItem
                onClick={() => {
                  setComponentState({
                    isLoading: true,
                    sortMode: 'old'
                  })
                  localStorage.setItem('imagePageSort', 'old')
                  fetchImages()

                  const newQuery = Object.assign(
                    {},
                    parseQueryString(window?.location?.search)
                  )
                  newQuery.sort = 'old'
                  //@ts-ignore
                  router.push(`?${new URLSearchParams(newQuery).toString()}`)

                  trackEvent({
                    event: `MENU_CLICK`,
                    action: 'sort_old',
                    context: '/pages/images'
                  })
                }}
              >
                Sort by Oldest
              </DropDownMenuItem>
            </DropDownMenu>
          )}
        </div>
      </div>
      <div className="mb-2 text-sm">
        <strong>Important:</strong> All images persist within your local browser
        cache and are not stored on a remote server. Clearing your cache will{' '}
        <strong>delete</strong> all images.
      </div>
      <div className="flex flex-row justify-between w-full">
        {!componentState.deleteMode && componentState.totalImages > 0 && (
          <div className="mb-2 text-sm text-teal-500">
            Showing {currentOffset} - {maxOffset} of{' '}
            <strong>{componentState.totalImages}</strong> {countDescriptor()}
            images {componentState.sortMode === 'new' && `(↓ newest)`}
            {componentState.sortMode === 'old' && `(↓ oldest)`}
          </div>
        )}
        {componentState.deleteMode && (
          <>
            <div className="mb-2 text-sm text-teal-500">
              selected ({componentState.deleteSelection.length})
            </div>
            <ButtonContainer>
              <TextButton
                onClick={() => {
                  setComponentState({ deleteMode: false, deleteSelection: [] })
                }}
                tabIndex={0}
              >
                cancel
              </TextButton>
              <TextButton
                onClick={() => {
                  handleSelectAll()
                }}
                tabIndex={0}
              >
                select all
              </TextButton>
              <TextButton onClick={handleDownloadClick} tabIndex={0}>
                download
              </TextButton>
              <TextButton
                color="red"
                onClick={() => {
                  if (componentState.deleteSelection.length > 0) {
                    confirmationModal.show({
                      multiImage: componentState.deleteSelection.length > 1,
                      onConfirmClick: handleDeleteImageClick,
                      closeModal: () => {
                        setComponentState({
                          deleteMode: false,
                          deleteSelection: []
                        })
                      }
                    })
                  }
                }}
                tabIndex={0}
              >
                delete
              </TextButton>
            </ButtonContainer>
          </>
        )}
      </div>
      {!componentState.isLoading &&
        componentState.images.length === 0 &&
        componentState.filterMode !== 'all' && (
          <div className="mt-2 mb-2">
            No {countDescriptor()} images found for this filter.{' '}
            <Link
              href="/images"
              className="text-cyan-400"
              onClick={() => {
                setComponentState({
                  deleteMode: false,
                  filterMode: 'all',
                  showFilterMenu: false,
                  showLayoutMenu: false
                })
              }}
            >
              Reset filter and show all images.
            </Link>
          </div>
        )}
      {!componentState.isLoading &&
        componentState.images.length === 0 &&
        componentState.filterMode === 'all' && (
          <div className="mt-2 mb-2">
            You haven&apos;t created any images yet.{' '}
            <Link href="/" className="text-cyan-400">
              Why not create something?
            </Link>
          </div>
        )}
      {
        //@ts-ignore
        size && size.width < 890 && !imageDetailsModalOpen && !adHidden && (
          <div
            style={{
              margin: '0 auto',
              maxWidth: '520px',
              backgroundColor: 'var(--carbon-bg)'
            }}
          >
            <AdContainer key={window.location.href} />
          </div>
        )
      }

      {componentState.isLoading && (
        <div style={{ height: '100vh' }}>
          <Spinner />
        </div>
      )}
      <div className={defaultStyle}>
        {!componentState.isLoading &&
          componentState.images.length > 0 &&
          componentState.layoutMode === 'layout' && (
            <MasonryLayout columns={imageColumns} gap={8}>
              {componentState.images.map(
                (image: {
                  id: string
                  favorited: boolean
                  jobId: string
                  base64String: string
                  thumbnail: string
                  prompt: string
                  timestamp: number
                  seed: number
                  sampler: string
                  models: Array<string>
                }) => {
                  return (
                    <LazyLoad key={image.jobId} once>
                      <div className="relative">
                        <LinkEl
                          href={`/image/${image.jobId}`}
                          passHref
                          //@ts-ignore
                          onClick={(e) =>
                            handleImageClick(e, image.id, image.jobId)
                          }
                          tabIndex={0}
                        >
                          {!isMobile() && (
                            <TooltipComponent
                              hideIcon
                              tooltipId={'image_' + image.id}
                            >
                              <div
                                className="font-mono text-xs"
                                style={{
                                  overflowWrap: 'break-word',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <div className="mb-2">{image.prompt}</div>
                                {image.models &&
                                  Array.isArray(image.models) && (
                                    <div>Model: {image.models[0]}</div>
                                  )}
                                <div>Sampler: {image.sampler}</div>
                              </div>
                            </TooltipComponent>
                          )}
                          <img
                            id={'image_' + image.id}
                            src={
                              'data:image/webp;base64,' +
                              (image.thumbnail || image.base64String)
                            }
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
                              width={1}
                              size={32}
                              shadow
                            />
                          )}
                        </LinkEl>
                      </div>
                    </LazyLoad>
                  )
                }
              )}
            </MasonryLayout>
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
                  thumbnail: string
                  prompt: string
                  timestamp: number
                  seed: number
                  favorited: boolean
                  sampler: string
                  models: Array<string>
                }) => {
                  return (
                    <LazyLoad key={image.jobId} once>
                      <div className="relative">
                        <LinkEl
                          href={`/image/${image.jobId}`}
                          passHref
                          //@ts-ignore
                          onClick={(e) =>
                            handleImageClick(e, image.id, image.jobId)
                          }
                          tabIndex={0}
                        >
                          {!isMobile() && (
                            <TooltipComponent tooltipId={'image_' + image.id}>
                              <div
                                className="font-mono text-xs"
                                style={{
                                  overflowWrap: 'break-word',
                                  wordBreak: 'break-word'
                                }}
                              >
                                <div className="mb-2">{image.prompt}</div>
                                <div>Model: {image.models[0]}</div>
                                <div>Sampler: {image.sampler}</div>
                              </div>
                            </TooltipComponent>
                          )}
                          <ImageSquare
                            id={'image_' + image.id}
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
                              width={1}
                              size={32}
                              shadow
                            />
                          )}
                        </LinkEl>
                      </div>
                    </LazyLoad>
                  )
                }
              )}
            </>
          )}
      </div>
      {!componentState.isLoading && componentState.totalImages > LIMIT && (
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
            disabled={currentOffset >= componentState.totalImages - LIMIT - 1}
            onClick={() => handleLoadMore('next')}
            width="52px"
          >
            Next
          </Button>
          <Button
            disabled={currentOffset >= componentState.totalImages - LIMIT - 1}
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
