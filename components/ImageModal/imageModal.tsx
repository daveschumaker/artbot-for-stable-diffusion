import { useRouter } from 'next/router'
import React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import { base64toBlob, downloadFile } from '../../utils/imageUtils'
import ConfirmationModal from '../ConfirmationModal'
import DownloadIcon from '../icons/DownloadIcon'
import EyeIcon from '../icons/EyeIcon'
import LinkIcon from '../icons/LinkIcon'
import ShareIcon from '../icons/ShareIcon'
import TrashIcon from '../icons/TrashIcon'
import SpinnerV2 from '../Spinner'
import { Button } from '../UI/Button'
import InteractiveModal from '../UI/InteractiveModal/interactiveModal'
import Linker from '../UI/Linker'
import ImageNavWrapper from './ImageNavWrapper'
import RateMyImage from './RateMyImage'

interface IProps {
  disableNav?: boolean
  handleClose(): void
  handleDeleteImageClick(imageId: string, jobId?: string): void
  handleLoadNext(): void
  handleLoadPrev(): void
  imageDetails: any
  loading?: boolean
  reverseButtons?: boolean
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 8px 16px 8px;

  overflow-y: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  * {
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }
`

const OptionsRow = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  margin-top: 12px;
  justify-content: center;
  width: 100%;

  @media (min-width: 640px) {
    column-gap: 8px;
    flex-direction: row;
  }
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 4px;
  padding-top: 24px;
  margin: 0 16px;
`

const StyledModal = styled(InteractiveModal)`
  height: 100%;
  overflow-y: auto;
  z-index: 30;
  @media (min-width: 640px) {
    /* height: auto; */
    /* max-height: 100vh; */
    height: calc(100% - 256px);
    max-height: 750px;
  }
`

const ImageDetails = styled.div`
  padding-top: 16px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    Liberation Mono, Courier New, monospace;
  margin: 0 64px;
  text-align: center;
`

const ImageModal = ({
  disableNav = false,
  handleClose,
  handleDeleteImageClick = () => {},
  handleLoadNext,
  handleLoadPrev,
  imageDetails = {},
  loading = false,
  reverseButtons = false
}: IProps) => {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const ref = useRef<any>(null)
  const [componentState, setComponentState] = useComponentState({
    loading: true,
    containerHeight: 512,
    imageMaxHeight: 700,
    mouseHover: false,
    showTiles: false,
    showSourceImg: false
  })

  const handleDeleteImage = () => {
    setShowDeleteModal(true)
  }

  const handleLoadMore = useCallback(
    async (btn: string) => {
      setComponentState({
        loading: true
      })

      if (btn === 'prev') {
        handleLoadPrev()
      } else {
        handleLoadNext()
      }
    },
    [handleLoadNext, handleLoadPrev, setComponentState]
  )

  const handleShareClick = async () => {
    try {
      const blob = await base64toBlob(imageDetails.base64String, 'image/webp')

      await navigator.share({
        text: `"${imageDetails.prompt}"\n\nvia: https://tinybots.net/artbot\n`,
        // url: 'https://tinybots.net/artbot',
        files: [
          new File([blob], 'image.png', {
            // @ts-ignore
            type: blob.type
          })
        ]
      })
    } catch (error) {
      console.log('Sharing failed!', error)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (disableNav) return
        if (reverseButtons) {
          handleLoadMore('prev')
        } else {
          handleLoadMore('next')
        }
      } else if (e.key === 'ArrowRight') {
        if (disableNav) return
        if (reverseButtons) {
          handleLoadMore('next')
        } else {
          handleLoadMore('prev')
        }
      } else if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'Delete') {
        handleDeleteImage()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    disableNav,
    handleClose,
    handleLoadMore,
    reverseButtons,
    setComponentState
  ])

  useEffect(() => {
    if (ref?.current?.clientHeight) {
      setTimeout(() => {
        let containerHeight = ref?.current?.clientHeight ?? 0
        let imageHeight = containerHeight

        if (window.innerHeight <= containerHeight) {
          containerHeight = window.innerHeight - 80
          imageHeight = window.innerHeight - 170
        }

        setComponentState({
          containerHeight: containerHeight,
          imageMaxHeight: imageHeight
        })
      }, 100)
    }
  }, [imageDetails.base64String, setComponentState])

  console.log(`imageDetails`, imageDetails)

  return (
    <StyledModal
      handleClose={handleClose}
      setDynamicHeight={componentState.containerHeight}
    >
      {showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => {
            setShowDeleteModal(false)
            handleDeleteImageClick(imageDetails.id)
          }}
          closeModal={() => setShowDeleteModal(false)}
        />
      )}
      {loading && (
        <ContentWrapper>
          <SpinnerV2 />
        </ContentWrapper>
      )}
      {!loading && imageDetails.base64String && (
        <ContentWrapper ref={ref}>
          {componentState.showTiles && (
            <div
              className={`w-full h-[512px] bg-repeat`}
              style={{
                backgroundImage: `url("data:image/webp;base64,${imageDetails.base64String}")`,
                backgroundSize: '128px'
              }}
            />
          )}
          {!componentState.showTiles && (
            <ImageNavWrapper
              loading={imageDetails.loading}
              base64String={
                componentState.showSourceImage && imageDetails.source_image
                  ? imageDetails.source_image
                  : imageDetails.base64String
              }
              disableNav={disableNav}
              handleLoadNext={handleLoadNext}
              handleLoadPrev={handleLoadPrev}
              handleClose={handleClose}
              jobId={imageDetails.jobId}
            />
          )}
          <OptionsRow>
            <Button
              onClick={() => {
                handleClose()
                router.push(`/image/${imageDetails.jobId}`)
              }}
            >
              <LinkIcon /> Image Details
            </Button>
            {imageDetails.source_image && (
              <Button
                onClick={() => {
                  if (componentState.showSourceImage) {
                    setComponentState({ showSourceImage: false })
                  } else {
                    setComponentState({ showSourceImage: true })
                  }
                }}
              >
                <EyeIcon />{' '}
                {componentState.showSourceImage ? 'Hide Source' : 'View Source'}
              </Button>
            )}
            {imageDetails.tiling && (
              <Button
                title="View tiles"
                // @ts-ignore
                onClick={() => {
                  if (componentState.showTiles) {
                    setComponentState({ showTiles: false })
                  } else if (imageDetails.source_image) {
                    setComponentState({ showTiles: true })
                  }
                }}
              >
                <EyeIcon />
                <span className="hidden md:inline-block">Show tiles</span>
              </Button>
            )}
            <Button
              title="Download PNG"
              // @ts-ignore
              onClick={() => downloadFile(imageDetails)}
            >
              <DownloadIcon />
              <span className="hidden md:inline-block">Download PNG</span>
            </Button>
            {
              // @ts-ignore
              navigator.share && (
                <Button onClick={() => handleShareClick()}>
                  <ShareIcon />
                </Button>
              )
            }
            <Button btnType="secondary" onClick={() => handleDeleteImage()}>
              <TrashIcon /> Delete
            </Button>
          </OptionsRow>
          {!imageDetails.hasUserRating &&
            imageDetails.shareImagesExternally && (
              <RateMyImage jobId={imageDetails.jobId} />
            )}
          <TextWrapper>
            <div
              onClick={() => {
                handleClose()
                router.push(`/image/${imageDetails.jobId}`)
              }}
            >
              <Linker
                href={`/image/${imageDetails.jobId}`}
                disableLinkClick
                passHref
              >
                <LinkIcon />
              </Linker>
            </div>
            {imageDetails.prompt}
          </TextWrapper>
          <ImageDetails>
            Steps: {imageDetails.steps} | Guidance: {imageDetails.cfg_scale} |
            Sampler: {imageDetails.sampler} | Model: {imageDetails.model} |
            Seed: {imageDetails.seed} | Karras:{' '}
            {
              // @ts-ignore
              imageDetails?.karras ? 'true' : 'false'
            }{' '}
            | H x W:{' '}
            {
              //@ts-ignore
              `${imageDetails.height} x ${imageDetails.width}`
            }
          </ImageDetails>
        </ContentWrapper>
      )}
    </StyledModal>
  )
}

export default ImageModal
