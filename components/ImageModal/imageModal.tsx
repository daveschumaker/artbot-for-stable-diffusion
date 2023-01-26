import { useRouter } from 'next/router'
import React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import { downloadFile } from '../../utils/imageUtils'
import ConfirmationModal from '../ConfirmationModal'
import DownloadIcon from '../icons/DownloadIcon'
import LinkIcon from '../icons/LinkIcon'
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
  handleDeleteImageClick(imageId: string): void
  handleLoadNext(): void
  handleLoadPrev(): void
  imageDetails: any
  loading?: boolean
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
  flex-direction: row;
  column-gap: 8px;
  margin-top: 12px;
  justify-content: center;
  width: 100%;
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 4px;
  padding-top: 24px;
  margin: 0 16px;
`

const StyledModal = styled(InteractiveModal)`
  overflow-y: auto;
  @media (min-width: 640px) {
    height: auto;
    max-height: 100vh;
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
  loading = false
}: IProps) => {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const ref = useRef<any>(null)
  const [componentState, setComponentState] = useComponentState({
    loading: true,
    containerHeight: 512,
    imageMaxHeight: 700,
    mouseHover: false
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (disableNav) return
        handleLoadMore('next')
      } else if (e.key === 'ArrowRight') {
        if (disableNav) return
        handleLoadMore('prev')
      } else if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'Delete') {
        handleDeleteImage()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [disableNav, handleClose, handleLoadMore, setComponentState])

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

  return (
    <StyledModal
      handleClose={handleClose}
      setDynamicHeight={componentState.containerHeight}
    >
      {showDeleteModal && (
        <ConfirmationModal
          onConfirmClick={() => {
            setShowDeleteModal(false)
            handleDeleteImageClick(imageDetails.jobId)
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
          <ImageNavWrapper
            loading={imageDetails.loading}
            base64String={imageDetails.base64String}
            disableNav={disableNav}
            handleLoadNext={handleLoadNext}
            handleLoadPrev={handleLoadPrev}
            handleClose={handleClose}
            jobId={imageDetails.jobId}
          />
          <OptionsRow>
            <Button
              onClick={() => {
                router.push(`/image/${imageDetails.jobId}`)
              }}
            >
              <LinkIcon /> Image Details
            </Button>
            <Button
              title="Download PNG"
              // @ts-ignore
              onClick={() => downloadFile(imageDetails)}
            >
              <DownloadIcon />
              <span className="hidden md:inline-block">Download PNG</span>
            </Button>
            <Button btnType="secondary" onClick={() => handleDeleteImage()}>
              <TrashIcon /> Delete
            </Button>
          </OptionsRow>
          {!imageDetails.hasUserRating &&
            imageDetails.shareImagesExternally && (
              <RateMyImage jobId={imageDetails.jobId} />
            )}
          <TextWrapper>
            <div onClick={handleClose}>
              <Linker href={`/image/${imageDetails.jobId}`} passHref>
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
