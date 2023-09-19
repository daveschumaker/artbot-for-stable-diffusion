/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'

import Overlay from 'app/_components/Overlay'
import ImageNavigation from './imageNavigation'
import { useSwipeable } from 'react-swipeable'

import styles from './imageModal.module.css'
import clsx from 'clsx'
import useLockedBody from 'app/_hooks/useLockedBody'
import { setImageDetailsModalOpen } from 'app/_store/appStore'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { IconX } from '@tabler/icons-react'
import ImageDetails from '../ImageDetails'

interface Props {
  disableNav?: boolean
  imageDetails: CreateImageRequest
  handleClose: () => any
  handleDeleteImageClick?: () => any
  handleLoadNext?: () => any
  handleLoadPrev?: () => any
  handleReloadImageData?: () => any
  onCloseCallback?: () => any
  onDeleteCallback?: () => any
}

const ImageModal = ({
  disableNav = false,
  handleClose = () => {},
  handleDeleteImageClick = () => {},
  handleLoadNext,
  handleLoadPrev,
  handleReloadImageData = () => {},
  onCloseCallback = () => {},
  onDeleteCallback = () => {},
  imageDetails
}: Props) => {
  const modal = useModal()
  const [, setLocked] = useLockedBody(false)
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (disableNav || !handleLoadNext) return
      handleLoadNext()
    },
    onSwipedRight: () => {
      if (disableNav || !handleLoadPrev) return
      handleLoadPrev()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 25
  })

  const onClose = useCallback(() => {
    handleClose()
    setImageDetailsModalOpen(false)
    modal.remove()
  }, [handleClose, modal])

  const closeSwipe = useSwipeable({
    onSwipedDown: () => {
      onClose()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 150
  })

  const [showTiles, setShowTiles] = useState(false)

  const handleTiling = (bool: boolean) => {
    setShowTiles(bool)
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTiles) {
          return
        }

        onClose()
      }

      if (e.key === 'ArrowLeft' && handleLoadPrev) {
        handleLoadPrev()
      }

      if (e.key === 'ArrowRight' && handleLoadNext) {
        handleLoadNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose, handleLoadNext, handleLoadPrev, showTiles])

  useEffect(() => {
    setLocked(true)

    return () => {
      setLocked(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Overlay handleClose={onClose} />
      <div
        id="image-modal"
        className={clsx(styles['image-modal'])}
        {...handlers}
        style={{ maxWidth: '1280px' }}
      >
        <div
          className="flex flex-row justify-end w-full pr-2 mb-2"
          {...closeSwipe}
        >
          <div className={styles['close-btn']} onClick={onClose}>
            <IconX size={28} />
          </div>
        </div>
        {!showTiles && !disableNav && handleLoadPrev && handleLoadNext && (
          <ImageNavigation
            handleLoadNext={handleLoadNext}
            handleLoadPrev={handleLoadPrev}
          />
        )}
        <div
          id="image-details-content"
          className={styles['scrollable-content']}
        >
          <ImageDetails
            handleClose={onClose}
            handleDeleteImageClick={() => {
              onDeleteCallback()
              handleDeleteImageClick()
              onCloseCallback()
            }}
            handleReloadImageData={handleReloadImageData}
            imageDetails={imageDetails}
            isModal={true}
            handleTiling={handleTiling}
          />
        </div>
      </div>
    </>
  )
}

export default NiceModal.create(ImageModal)
