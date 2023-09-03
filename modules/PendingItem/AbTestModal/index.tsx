/* eslint-disable @next/next/no-img-element */
import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import styles from './component.module.css'
import clsx from 'clsx'

export default function AbTestModal({
  handleClose = () => {},
  jobDetails,
  modalHeight,
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
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = [
    { src: 'data:image/webp;base64,' + jobDetails.base64String },
    { src: 'data:image/webp;base64,' + secondaryImage }
  ]

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

  return (
    <div
      className={styles.carouselContainer}
      style={{ height: `${modalHeight}px` }}
    >
      <div className={styles.iconCaretLeft}>
        <IconCaretLeftFilled onClick={goPrev} />
      </div>
      <img
        src={images[currentIndex].src}
        alt="current-carousel-item"
        className={clsx(styles.carouselImage)}
      />
      <IconCaretRightFilled
        className={styles.iconCaretRight}
        onClick={goNext}
      />
    </div>
  )
}
