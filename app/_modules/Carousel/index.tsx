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
  width: number
}

const Carousel: React.FC<PropType> = (props) => {
  const { images, options = { loop: true } } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
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

  return (
    <>
      <div className="embla">
        <div className="embla__viewport" ref={emblaRef}>
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
                    maxWidth: '100%',
                    maxHeight: 'calc(100% - 30px)',
                    height: 'auto', // or width: 'auto', depending on which dimension you want to control
                    objectFit: 'contain' // This ensures the image is scaled to maintain its aspect ratio
                  }}
                />
              </div>
            ))}
          </div>
        </div>
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
      </div>

      {images.length > 1 && (
        <div className="embla__dots">
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
