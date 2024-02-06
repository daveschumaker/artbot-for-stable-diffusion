import clsx from 'clsx'
import { Menu, MenuItem, MenuButton, MenuDivider } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

import { useCallback, useContext, useEffect, useState } from 'react'
import {
  getImageDetails,
  getParentJobDetails,
  updateCompletedJob
} from 'app/_utils/db'
import { downloadFile } from 'app/_utils/imageUtils'

import styles from './imageDetails.module.css'
import {
  interrogateImage,
  upscaleImage
} from 'app/_controllers/imageDetailsCommon'
import { useRouter } from 'next/navigation'
import { uuidv4 } from 'app/_utils/appUtils'
import { SourceProcessing } from 'app/_utils/promptUtils'
import { getRelatedImages } from 'app/_pages/ImagePage/image.controller'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import {
  IconArrowsDiff,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconHeart,
  IconRefresh,
  IconResize,
  IconTrash,
  IconWall
} from '@tabler/icons-react'
import PromptInputSettings from 'app/_data-models/PromptInputSettings'
import { CONTROL_TYPES } from '_types/horde'
import ConfirmationModal from 'app/_modules/ConfirmationModal'
import useFavorite from '../hooks/useFavorite'
import useDelete from '../hooks/useDelete'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import useReroll from '../hooks/useReroll'
import useDownload from '../hooks/useDownload'
import ShortlinkButton from './ShortlinkButtonV2'
import useCopy from '../hooks/useCopy'

const ImageOptions = ({
  handleClose,
  handleReloadImageData = () => {},
  isModal,
  showSource,
  showTiles,
  setShowSource,
  setShowTiles
}: {
  handleClose: () => any
  handleReloadImageData?: () => any
  isModal: boolean
  jobId: string
  showSource: boolean
  showTiles: boolean
  setShowSource(): void
  setShowTiles: (bool: boolean) => any
}) => {
  const context = useContext(ImageDetailsContext)
  const { currentImageId, imageDetails, imageSrcs } = context
  const { jobId } = imageDetails
  const imageId = currentImageId

  const router = useRouter()
  const confirmationModal = useModal(ConfirmationModal)
  const [favorited, onFavoriteClick] = useFavorite({
    imageId,
    jobId
  })
  const [onCopyPromptClick, onCopyImageDetailsClick, onCopyImageClick] =
    useCopy()
  const [onDeleteImageClick] = useDelete({ imageId })
  const [onDownloadClick] = useDownload()
  const [, onRerollClick] = useReroll()

  const [pendingUpscale, setPendingUpscale] = useState(false)
  const [hasParentJob, setHasParentJob] = useState(false)
  const [hasRelatedImages, setHasRelatedImages] = useState(false)
  const [tileSize, setTileSize] = useState('128px')

  const fetchParentJobDetails = useCallback(async () => {
    const details: CreateImageRequest = await getParentJobDetails(
      imageDetails.parentJobId as string
    )

    if (imageDetails.jobId === details.jobId || !imageDetails.parentJobId) {
      setHasParentJob(false)
    } else {
      setHasParentJob(true)
    }
  }, [imageDetails.jobId, imageDetails.parentJobId])

  const handleTileClick = (size: string) => {
    setTileSize(size)
    setShowTiles(true)
  }

  const handleUpscaleClick = useCallback(async () => {
    if (pendingUpscale) {
      return
    }

    setPendingUpscale(true)

    await upscaleImage(imageDetails)
    router.push('/pending')
    handleClose()
  }, [handleClose, imageDetails, pendingUpscale, router])

  const onDetachParent = useCallback(async () => {
    await updateCompletedJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        parentJobId: uuidv4()
      })
    )

    // Bust memoization cache
    getImageDetails.delete(imageDetails.jobId as string)

    handleReloadImageData()
  }, [handleReloadImageData, imageDetails])

  const fetchRelatedImages = useCallback(async () => {
    const result = await getRelatedImages(imageDetails.parentJobId as string)

    if (result && result.length > 0) {
      setHasRelatedImages(true)
    }
  }, [imageDetails.parentJobId])

  useEffect(() => {
    fetchRelatedImages()
  }, [fetchRelatedImages, imageDetails.parentJobId])

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTiles) {
          e.stopImmediatePropagation()
          e.preventDefault()
          setShowTiles(false)
        }
      }

      if (e.key === 'Backspace') {
        onDeleteImageClick()
      }

      if (e.key === 'Delete') {
        onDeleteImageClick()
      }

      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        onFavoriteClick()
      }

      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        downloadFile(imageDetails)
      }

      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        onRerollClick()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    confirmationModal,
    handleClose,
    onRerollClick,
    imageDetails,
    onDeleteImageClick,
    onFavoriteClick,
    setShowTiles,
    showTiles
  ])

  useEffect(() => {
    fetchParentJobDetails()
  }, [fetchParentJobDetails, imageDetails.parentJobId])

  if (!currentImageId) return null

  const hasSource = imageDetails.source_image

  return (
    <>
      {/* {showTiles && (
        <div
          className="z-[102] fixed top-0 left-0 right-0 bottom-0 bg-repeat"
          onClick={() => setShowTiles(false)}
          style={{
            backgroundImage: `url("data:image/webp;base64,${imageDetails.base64String}")`,
            backgroundSize: tileSize
          }}
        ></div>
      )} */}
      <div
        id="image-options-wrapper"
        className="flex flex-row w-full mt-3"
        style={{
          justifyContent: 'flex-end',
          maxWidth: '768px',
          width: '100%',
          margin: '0 auto',
          marginTop: '8px'
        }}
      >
        <div
          id="image-options-buttons"
          className="w-full flex flex-row items-center justify-between tablet:justify-end max-w-[768px] gap-2 md:gap-4"
          style={{
            justifyContent: 'center'
          }}
        >
          <div className={styles['button-icon']}>
            <Menu
              menuButton={
                <MenuButton>
                  <IconDotsVertical stroke={1.5} />
                </MenuButton>
              }
              transition
              menuClassName={styles['menu']}
            >
              {isModal && (
                <MenuItem
                  className="text-sm"
                  onClick={() => {
                    router.push(`/image/${imageDetails.jobId}`)
                    handleClose()
                  }}
                >
                  View image details page
                </MenuItem>
              )}
              {hasParentJob && (
                <MenuItem className="text-sm" onClick={onDetachParent}>
                  Detach from parent job
                </MenuItem>
              )}
              <MenuItem
                className="text-sm"
                onClick={() => downloadFile(imageDetails)}
              >
                Download image
              </MenuItem>
              <MenuDivider />
              <MenuItem
                className="text-sm"
                onClick={() => {
                  interrogateImage(imageDetails)
                  router.push(`/interrogate?user-share=true`)
                  handleClose()
                }}
              >
                Interrogate (img2text)
              </MenuItem>
              <MenuItem className="text-sm" onClick={handleUpscaleClick}>
                Upscale image {pendingUpscale && ' (processing...)'}
              </MenuItem>
              <MenuDivider />
              <MenuItem
                className="text-sm"
                onClick={async () => {
                  const transformJob = CreateImageRequest.toDefaultPromptInput(
                    Object.assign({}, imageDetails, {
                      numImages: 1,
                      seed: ''
                    })
                  )

                  transformJob.source_mask = ''
                  transformJob.source_processing = SourceProcessing.Img2Img
                  transformJob.control_type = CONTROL_TYPES.canny
                  transformJob.source_image = imageDetails.base64String
                  await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(
                    transformJob
                  )

                  router.push(`/create?panel=img2img&edit=true`)
                  handleClose()
                }}
              >
                Use for ControlNet
              </MenuItem>
              <MenuItem
                className="text-sm"
                onClick={async () => {
                  const transformJob = CreateImageRequest.toDefaultPromptInput(
                    Object.assign({}, imageDetails, {
                      control_type: '',
                      numImages: 1,
                      seed: '',
                      source_image: imageDetails.base64String,
                      source_mask: '',
                      source_processing: SourceProcessing.Img2Img
                    })
                  )
                  await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(
                    transformJob
                  )

                  router.push(`/create?panel=img2img&edit=true`)
                  handleClose()
                }}
              >
                Use for img2img
              </MenuItem>
              <MenuItem
                className="text-sm"
                onClick={async () => {
                  const transformJob = CreateImageRequest.toDefaultPromptInput(
                    Object.assign({}, imageDetails, {
                      control_type: '',
                      numImages: 1,
                      seed: '',
                      source_image: imageDetails.base64String,
                      source_mask: '',
                      source_processing: SourceProcessing.InPainting
                    })
                  )
                  await PromptInputSettings.updateSavedInput_NON_DEBOUNCED(
                    transformJob
                  )

                  router.push(`/create?panel=inpainting&edit=true`)
                  handleClose()
                }}
              >
                Use for inpainting
              </MenuItem>
              {hasRelatedImages && (
                <>
                  <MenuDivider />
                  <MenuItem
                    className="text-sm"
                    onClick={() => {
                      router.push(`/image/${imageDetails.jobId}#related-images`)
                      handleClose()
                    }}
                  >
                    View related images
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
          <div className={styles['button-icon']}>
            <Menu
              menuButton={
                <MenuButton>
                  <IconCopy stroke={1.5} />
                </MenuButton>
              }
              transition
              menuClassName={styles['menu']}
            >
              <MenuItem className="text-sm" onClick={onCopyPromptClick}>
                Use the prompt from this image
              </MenuItem>
              <MenuItem className="text-sm" onClick={onCopyImageDetailsClick}>
                Use all settings from this image
              </MenuItem>
              <MenuDivider />
              <MenuItem className="text-sm" onClick={onCopyImageClick}>
                Copy image to clipboard
              </MenuItem>
            </Menu>
          </div>
          {imageDetails.source_processing === SourceProcessing.Prompt && (
            <ShortlinkButton imageDetails={imageDetails} />
          )}
          {imageDetails.tiling && (
            <div className={styles['button-icon']}>
              <Menu
                menuButton={
                  <MenuButton>
                    <IconWall stroke={1.5} />
                  </MenuButton>
                }
                transition
                menuClassName={styles['menu']}
              >
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('64px')}
                >
                  64px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('128px')}
                >
                  128px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('256px')}
                >
                  256px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('512px')}
                >
                  512px tiles
                </MenuItem>
                <MenuItem
                  className="text-sm"
                  onClick={() => handleTileClick('1024px')}
                >
                  1024px tiles
                </MenuItem>
              </Menu>
            </div>
          )}
          <div
            className={styles['button-icon']}
            onClick={() => {
              NiceModal.show('fullscreen-view', {
                handleClose: () => NiceModal.remove('fullscreen-view'),
                imageSrc: imageSrcs.filter(
                  (img) => img.id === currentImageId
                )[0]
              })
            }}
          >
            <IconResize strokeWidth={1.25} />
          </div>
          {hasSource && (
            <div
              className={styles['button-icon']}
              onClick={setShowSource}
              style={{
                color: showSource ? 'var(--main-color' : 'var(--active-color)'
              }}
            >
              <IconArrowsDiff strokeWidth={1.25} />
            </div>
          )}
          <div
            className={clsx(styles['button-icon'], styles['mobile-hide'])}
            onClick={onDownloadClick}
            // onClick={() => downloadFile(imageDetails)}
          >
            <IconDownload stroke={1.5} />
          </div>
          <div className={clsx(styles['button-icon'])} onClick={onRerollClick}>
            <IconRefresh stroke={1.5} />
          </div>
          <div className={styles['button-icon']} onClick={onFavoriteClick}>
            <IconHeart
              style={{
                color: favorited ? '#14B8A6' : undefined,
                fill: favorited ? '#14B8A6' : undefined
              }}
              stroke={1.5}
            />
          </div>
          <div
            className={clsx(styles['button-icon'])}
            onClick={onDeleteImageClick}
          >
            <IconTrash stroke={1.5} />
          </div>
        </div>
      </div>
    </>
  )
}

export default ImageOptions
