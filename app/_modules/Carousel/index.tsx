/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { DotButton, PrevButton, NextButton } from './CarouselArrowsDotsButtons'
// import imageByIndex from './imageByIndex'
import './carousel.css'

type PropType = {
  images: string[]
  options?: EmblaOptionsType
  height: number
  updateImageIndex?: (i: number) => void
  width: number
}

const Carousel: React.FC<PropType> = (props) => {
  const {
    images,
    options = { loop: true, watchDrag: images.length > 1 },
    updateImageIndex = () => {},
    width
  } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [emblaHeight, setEmblaHeight] = useState('auto')
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev()
      updateImageIndex(emblaApi.slidesInView()[0])
    }
  }, [emblaApi, updateImageIndex])

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext()
      updateImageIndex(emblaApi.slidesInView()[0])
    }
  }, [emblaApi, updateImageIndex])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index)
        updateImageIndex(emblaApi.slidesInView()[0])
      }
    },
    [emblaApi, updateImageIndex]
  )

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  const handleKeyDown = useCallback(
    (event: { keyCode: number }) => {
      if (event.keyCode === 37) {
        // Left arrow key
        scrollPrev()
      } else if (event.keyCode === 39) {
        // Right arrow key
        scrollNext()
      }
    },
    [scrollNext, scrollPrev]
  )

  useEffect(() => {
    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyDown)

    // Clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  const updateHeight = () => {
    const img = document.getElementsByClassName('embla__slide__img')[0]

    if (img?.clientHeight) {
      setEmblaHeight(`${img.clientHeight}px`)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', updateHeight)
    // Call it initially in case the image is already loaded
    updateHeight()

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [images])

  return (
    <>
      <div className="embla mb-2" style={{ height: emblaHeight }}>
        {images.length > 1 && (
          <>
            <div className="embla__buttons__left">
              <PrevButton onClick={scrollPrev} disabled={prevBtnDisabled} />
            </div>
            <div className="embla__buttons__right">
              <NextButton onClick={scrollNext} disabled={nextBtnDisabled} />
            </div>
          </>
        )}
        <div
          className="embla__viewport"
          ref={emblaRef}
          style={{ height: emblaHeight }}
        >
          <div className="embla__container">
            {images.map((src: string, idx: number) => (
              <div className="embla__slide" key={idx}>
                <div className="embla__slide__number">
                  <span>{idx + 1}</span>
                </div>

                <img
                  className="embla__slide__img"
                  src={src}
                  alt="Your alt text"
                  // style={{
                  //   height: `${height}px`,
                  //   width: `${width}px`,
                  //   maxHeight: `calc(100% - 30px)`
                  // }}
                  style={{
                    maxWidth: width ? `${width}px` : '100%',
                    maxHeight: 'calc(100% - 30px)',
                    height: 'auto', // or width: 'auto', depending on which dimension you want to control
                    objectFit: 'contain' // This ensures the image is scaled to maintain its aspect ratio
                  }}
                  onLoad={updateHeight}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="embla__dots mb-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => scrollTo(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default Carousel
