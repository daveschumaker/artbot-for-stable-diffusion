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
  fetchImageDetails(action: string, id: number): void
  handleClose(): void
  id: number
  jobId: string
  loading: boolean
}

const ImageNavWrapper = ({
  base64String,
  fetchImageDetails,
  handleClose,
  id,
  jobId,
  loading
}: IProps) => {
  const router = useRouter()
  const [mouseHover, setMouseHover] = useState(false)
  const [swiping, setSwiping] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwiping(true)
      fetchImageDetails('next', id)
    },
    onSwipedRight: () => {
      setSwiping(true)
      fetchImageDetails('prev', id)
    },
    onSwipedDown: () => {
      setSwiping(true)
      handleClose()
    },
    preventScrollOnSwipe: true,
    onTouchEndOrOnMouseUp: () => {
      setTimeout(() => {
        setSwiping(false)
      }, 100)
    }
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
        <Linker href={`/image/${jobId}`} passHref tabIndex={0}>
          <StyledImage src={'data:image/webp;base64,' + base64String} />
        </Linker>
        {mouseHover && (
          <>
            <ImageNavButton
              action="PREV"
              fetchImageDetails={fetchImageDetails}
              id={id}
            />
            <ImageNavButton
              action="NEXT"
              fetchImageDetails={fetchImageDetails}
              id={id}
            />
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
  const idEqual = prevProps.id === nextProps.id

  return base64StringEqual && loadingEqual && idEqual
}

export default React.memo(ImageNavWrapper, areEqual)
