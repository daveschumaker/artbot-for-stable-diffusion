/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx'
import React, { useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import AdContainer from 'app/_components/AdContainer'

import styles from './imageDetails.module.css'
import ImageOptionsWrapper from './ImageOptionsWrapper'
import ParentImage from 'app/_components/ParentImage'
import { logError } from 'app/_utils/appUtils'
import { userInfoStore } from 'app/_store/userStore'
import { useWindowSize } from 'app/_hooks/useWindowSize'
import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import useWindowHeight from 'app/_hooks/useWindowHeight'
import ImageSettingsDisplay from './ImageSettingsDisplay'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import Img2ImgModal from 'app/_pages/ImagePage/Img2ImgModal'
import { IconPhotoUp, IconPlaylistX } from '@tabler/icons-react'
import ImageSquare from '../ImageSquare'

interface Props {
  imageDetails: CreateImageRequest
  isModal?: boolean
  handleClose?: () => any
  handleDeleteImageClick?: () => any
  handleReloadImageData?: () => any
  handleTiling?: (bool: any) => any
}

const ImageDetails = ({
  imageDetails,
  isModal = false,
  handleClose = () => {},
  handleDeleteImageClick,
  handleReloadImageData = () => {},
  handleTiling = () => {}
}: Props) => {
  const size = useWindowSize()
  const windowHeight = useWindowHeight()
  const { imageDetailsModalOpen } = useStore(appInfoStore)
  const showFullScreen = useFullScreenHandle()
  const [fullscreen, setFullscreen] = useState(false)
  const [showImg2ImgModal, setShowImg2ImgModal] = useState(false)
  const [showTiles, setShowTiles] = useState(false)

  if (!imageDetails || !imageDetails.base64String) {
    logError({
      path: window.location.href,
      errorMessage: 'ImageDetails.missingImageDetails',
      errorInfo: '',
      errorType: 'client-side',
      username: userInfoStore.state.username
    })
    return null
  }

  const handleFullScreen = () => {
    setFullscreen(true)
    showFullScreen.enter()
  }

  const handleOnTilingClick = (bool: boolean) => {
    handleTiling(bool)
    setShowTiles(bool)
  }

  const imgStyle: any = {
    maxWidth: '1024px',
    objectFit: 'contain',
    width: '100%'
  }

  return (
    <>
      <FullScreen
        handle={showFullScreen}
        onChange={(isFullscreen) => setFullscreen(isFullscreen)}
      >
        {fullscreen && (
          <div
            className="flex flex-row items-center justify-center w-full h-screen"
            onClick={() => {
              showFullScreen.exit()
            }}
          >
            <img
              className={clsx(styles.img, 'max-h-screen max-w-full')}
              src={'data:image/webp;base64,' + imageDetails.base64String}
              alt={imageDetails.prompt}
            />
          </div>
        )}
      </FullScreen>
      {showImg2ImgModal && (
        <div className="z-[101] relative">
          <Img2ImgModal
            handleClose={() => setShowImg2ImgModal(false)}
            imageDetails={imageDetails}
          />
        </div>
      )}
      <div
        id="image-src"
        className={clsx(
          {
            loading: styles['img-loading']
          },
          'w-full flex justify-center'
        )}
      >
        <div
          className={'max-w-[1400px] flex flex-row' + styles['img-container']}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}
        >
          <img
            className={clsx(styles.img)}
            src={'data:image/webp;base64,' + imageDetails.base64String}
            alt={imageDetails.prompt}
            style={{ ...imgStyle, maxHeight: `${windowHeight - 64}px` }}
          />
        </div>
      </div>
      <ImageOptionsWrapper
        isModal={isModal}
        handleClose={handleClose}
        handleDeleteImageClick={handleDeleteImageClick}
        handleReloadImageData={handleReloadImageData}
        imageDetails={imageDetails}
        showTiles={showTiles}
        setShowTiles={handleOnTilingClick}
        handleFullScreen={handleFullScreen}
      />
      <div
        id="image-prompt-wrapper"
        className="flex flex-col items-center justify-start w-full mt-3"
      >
        <div className="text-[16px] tablet:text-[18px] px-4 w-full max-w-[768px]">
          <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
            <IconPlaylistX />
            Prompt
          </div>
          <div className="w-full text-sm ml-[8px] break-words">
            {imageDetails.prompt}
          </div>
        </div>
      </div>
      {imageDetails.negative && (
        <div
          id="image-negative-prompt-wrapper"
          className="flex flex-col items-center justify-start w-full mt-3"
        >
          <div className="text-[16px] tablet:text-[18px] px-4 w-full max-w-[768px]">
            <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
              <IconPlaylistX />
              Negative prompt
            </div>
            <div className="w-full text-sm ml-[8px] break-words">
              {imageDetails.negative}
            </div>
          </div>
        </div>
      )}
      {
        // @ts-ignore
        (size.width < 800 || imageDetailsModalOpen) && (
          <div className="flex flex-row justify-center w-full mt-3">
            <div
              style={{
                maxWidth: '704px',
                minHeight: '164px',
                // maxWidth: '768px',
                width: '100%',
                margin: '0 auto',
                marginTop: '8px'
              }}
            >
              <AdContainer shouldRefresh={imageDetails.id} />
            </div>
          </div>
        )
      }

      <ImageSettingsDisplay imageDetails={imageDetails} />

      <div
        id="image-params-wrapper"
        className="flex flex-col items-center justify-start w-full mt-3"
      >
        <div className="text-[16px] tablet:text-[18px] px-4 w-full max-w-[768px] gap-4 flex flex-row mb-3">
          {imageDetails.parentJobId && (
            <ParentImage
              jobId={imageDetails.jobId}
              parentJobId={imageDetails.parentJobId}
            />
          )}
          {imageDetails.source_image && (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold flex flex-row gap-2 items-center mb-[4px]">
                <IconPhotoUp />
                Source image
              </div>
              <div
                className="cursor-pointer"
                onClick={() => setShowImg2ImgModal(true)}
              >
                <ImageSquare
                  imageDetails={{
                    base64String: imageDetails.source_image
                  }}
                  imageType={imageDetails.imageMimeType}
                  size={140}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function areEqual(prevProps: any, nextProps: any) {
  if (prevProps?.imageDetails?.jobId !== nextProps?.imageDetails?.jobId) {
    return false
  }

  return true
}

export default React.memo(ImageDetails, areEqual)
