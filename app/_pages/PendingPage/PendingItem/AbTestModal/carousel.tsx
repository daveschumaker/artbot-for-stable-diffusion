import React, { CSSProperties } from 'react'
import { useSnapCarousel } from 'react-snap-carousel'

const styles = {
  root: {},
  scroll: {
    position: 'relative',
    display: 'flex',
    overflow: 'auto',
    scrollSnapType: 'x mandatory'
  },
  item: {
    width: '250px',
    height: '250px',
    flexShrink: 0
  },
  itemSnapPoint: {
    scrollSnapAlign: 'start'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  nextPrevButton: {},
  nextPrevButtonDisabled: { opacity: 0.3 },
  pagination: {
    display: 'flex'
  },
  paginationButton: {
    margin: '10px'
  },
  paginationButtonActive: { opacity: 0.3 },
  pageIndicator: {
    display: 'flex',
    justifyContent: 'center'
  }
} satisfies Record<string, CSSProperties>

interface CarouselProps<T> {
  readonly items: T[]
  readonly renderItem: (
    props: CarouselRenderItemProps<T>
  ) => React.ReactElement<CarouselItemProps>
}

interface CarouselRenderItemProps<T> {
  readonly item: T
  readonly isSnapPoint: boolean
}

export const Carousel = <T extends any>({
  items,
  renderItem
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    activePageIndex,
    prev,
    next,
    goTo,
    snapPointIndexes
  } = useSnapCarousel()
  return (
    <div style={styles.root}>
      <ul style={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i)
          })
        )}
      </ul>
      <div style={styles.controls} aria-hidden>
        <button
          style={{
            ...styles.nextPrevButton,
            ...(activePageIndex <= 0 ? styles.nextPrevButtonDisabled : {})
          }}
          onClick={() => prev()}
        >
          Prev
        </button>
        {pages.map((_, i) => (
          <button
            key={i}
            style={{
              ...styles.paginationButton,
              ...(activePageIndex === i ? styles.paginationButtonActive : {})
            }}
            onClick={() => goTo(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          style={{
            ...styles.nextPrevButton,
            ...(activePageIndex === pages.length - 1
              ? styles.nextPrevButtonDisabled
              : {})
          }}
          onClick={() => next()}
        >
          Next
        </button>
      </div>
      <div style={styles.pageIndicator}>
        {activePageIndex + 1} / {pages.length}
      </div>
    </div>
  )
}

interface CarouselItemProps {
  readonly isSnapPoint: boolean
  readonly children?: React.ReactNode
}

export const CarouselItem = ({ isSnapPoint, children }: CarouselItemProps) => (
  <li
    style={{
      ...styles.item,
      ...(isSnapPoint ? styles.itemSnapPoint : {})
    }}
  >
    {children}
  </li>
)
