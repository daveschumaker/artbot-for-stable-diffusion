/* eslint-disable @next/next/no-img-element */
import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import styles from './component.module.css'
import clsx from 'clsx'
import { ContentHeight } from 'app/_modules/AwesomeModal/awesomeModalProvider'
import RateAbTestImage from './rateImage'

export default function AbTestModal({
  handleClose = () => {},
  jobDetails,
  secondaryId,
  secondaryImage,
  setIsRated = () => {}
}: {
  handleClose?: () => any
  jobDetails: any
  modalHeight?: number
  secondaryId: string
  secondaryImage: string
  setIsRated: (value: boolean) => any
}) {
  const { maxModalHeight }: { maxModalHeight: any } = useContext(ContentHeight)
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = useMemo(
    () => [
      { src: 'data:image/webp;base64,' + jobDetails.base64String },
      { src: 'data:image/webp;base64,' + secondaryImage }
    ],
    [jobDetails.base64String, secondaryImage]
  )

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }, [currentIndex, images.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(images.length - 1)
    }
  }, [currentIndex, images.length])

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'ArrowLeft') {
        goPrev()
      } else if (event.key === 'ArrowRight') {
        goNext()
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [goNext, goPrev])

  const MAX_HEIGHT = !isNaN(maxModalHeight)
    ? `${maxModalHeight - 72}px`
    : '100%'

  return (
    <div className={styles.AbTestCarousel} style={{ maxHeight: MAX_HEIGHT }}>
      <div className={styles.iconCaretLeft}>
        <IconCaretLeftFilled onClick={goPrev} size={48} />
      </div>
      <IconCaretRightFilled
        className={styles.iconCaretRight}
        onClick={goNext}
        size={48}
      />
      <div className={styles.imageContainer}>
        <img
          className={styles.baseImage}
          src={images[0].src}
          style={{ maxHeight: MAX_HEIGHT }}
          alt="SDXL beta test"
        />
        <img
          alt="SDXL beta test"
          src={images[1].src}
          className={clsx(
            styles.baseImage,
            styles.carouselImage,
            currentIndex === 1 && styles.fadeIn
          )}
          style={{
            opacity: currentIndex === 1 ? '1' : 0,
            maxHeight: MAX_HEIGHT
          }}
        />
      </div>
      <RateAbTestImage
        setIsRated={setIsRated}
        handleClose={handleClose}
        jobDetails={jobDetails}
        secondaryId={secondaryId}
        secondaryImage={secondaryImage}
        selectedImg={currentIndex}
      />
    </div>
  )
}
