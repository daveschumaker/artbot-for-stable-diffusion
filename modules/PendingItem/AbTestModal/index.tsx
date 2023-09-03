/* eslint-disable @next/next/no-img-element */
import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import styles from './component.module.css'
import clsx from 'clsx'
import FlexRow from 'app/_components/FlexRow'

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
        <IconCaretLeftFilled onClick={goPrev} size={48} />
      </div>
      <FlexRow
        style={{
          alignItems: 'unset',
          justifyContent: 'center',
          height: `${modalHeight}px`,
          position: 'relative'
        }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img.src}
            alt={`Image ${index + 1}`}
            className={clsx(
              styles.carouselImage,
              currentIndex === index && styles.fadeIn
            )}
            style={{ opacity: currentIndex === index ? '1' : 0 }}
          />
        ))}
      </FlexRow>
      <IconCaretRightFilled
        className={styles.iconCaretRight}
        onClick={goNext}
        size={48}
      />
      <div>Hello.</div>
    </div>
  )
}
