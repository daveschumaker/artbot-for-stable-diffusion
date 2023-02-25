import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import styled from 'styled-components'
import SpinnerV2 from '../Spinner'
import Linker from '../UI/Linker'
import ImageNavButton from './ImageNavButton'

const NavContainer = styled.div`
  width: 100%;
  position: relative;
`

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  max-width: 100%;
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0, 0, 0, 0.6);
`

const StyledImage = styled.img`
  border-radius: 4px;
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 6px -5px rgb(0 0 0 / 20%);
  max-height: 512px;
`

interface IProps {
  base64String: string
  disableNav?: boolean
  handleClose?: () => void
  handleLoadNext(): void
  handleLoadPrev(): void
  jobId: string
  loading: boolean
}

const ImageNavWrapper = ({
  base64String,
  disableNav,
  handleClose = () => {},
  handleLoadNext = () => {},
  handleLoadPrev = () => {},
  jobId,
  loading
}: IProps) => {
  const router = useRouter()
  const [mouseHover, setMouseHover] = useState(false)
  const [swiping, setSwiping] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (disableNav) return
      setSwiping(true)
      handleLoadPrev()
    },
    onSwipedRight: () => {
      if (disableNav) return
      setSwiping(true)
      handleLoadNext()
    },
    onSwipedUp: () => {
      setSwiping(true)
    },
    onSwipedDown: () => {
      setSwiping(true)
      // handleClose()
    },
    preventScrollOnSwipe: true,
    onTouchEndOrOnMouseUp: () => {
      if (disableNav) return
      setTimeout(() => {
        setSwiping(false)
      }, 100)
    },
    swipeDuration: 250,
    trackTouch: true,
    delta: 35
  })

  const handleTouchEnd = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    if (swiping) {
      return
    }

    router.push(`/image/${jobId}`)
  }

  return (
    <NavContainer
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => {
        if (swiping) return
        setMouseHover(true)
      }}
      onMouseLeave={() => {
        if (swiping) return
        setMouseHover(false)
      }}
    >
      <ImageContainer {...handlers}>
        <Linker
          href={`/image/${jobId}`}
          onClick={() => {
            handleClose()
          }}
          passHref
          tabIndex={0}
        >
          <StyledImage src={'data:image/webp;base64,' + base64String} />
        </Linker>
        {!disableNav && mouseHover && (
          <>
            {/* Yes, the names make no sense here. Whatever, just go with it. */}
            <ImageNavButton action="PREV" handleOnClick={handleLoadNext} />
            <ImageNavButton action="NEXT" handleOnClick={handleLoadPrev} />
          </>
        )}
        {loading && (
          <ImageOverlay>
            <SpinnerV2 />
          </ImageOverlay>
        )}
      </ImageContainer>
    </NavContainer>
  )
}

function areEqual(prevProps: IProps, nextProps: IProps) {
  const base64StringEqual = prevProps.base64String === nextProps.base64String
  const loadingEqual = prevProps.loading === nextProps.loading

  return base64StringEqual && loadingEqual
}

export default React.memo(ImageNavWrapper, areEqual)
