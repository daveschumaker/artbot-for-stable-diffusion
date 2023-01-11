import { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import {
  getImageDetails,
  getNextImageDetails,
  getPrevImageDetails
} from '../../utils/db'
import ChevronLeftIcon from '../icons/ChevronLeftIcon'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import SpinnerV2 from '../Spinner'
import InteractiveModal from '../UI/InteractiveModal/interactiveModal'

interface IProps {
  jobId: string
  handleClose(): void
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 8px 16px 8px;

  overflow-y: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  * {
    -ms-overflow-style: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }
`

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  max-width: 100%;
`

const StyledImage = styled.img`
  border-radius: 4px;
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 6px -5px rgb(0 0 0 / 20%);
  max-height: 512px;
`

const TextWrapper = styled.div`
  padding-top: 24px;
  margin: 0 16px;
`

const StyledModal = styled(InteractiveModal)`
  overflow-y: auto;
  @media (min-width: 640px) {
    height: auto;
    max-height: 100vh;
  }
`

const ImageDetails = styled.div`
  padding-top: 16px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    Liberation Mono, Courier New, monospace;
  margin: 0 16px;
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

const NavContainer = styled.div`
  width: 100%;
  position: relative;
`

interface INavButtonProps {
  action: string
}

const NextPrevButton = styled.div<INavButtonProps>`
  user-select: none;
  background-color: white;
  display: flex;
  border-radius: 50%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  position: absolute;
  right: 8px;
  cursor: pointer;
  top: 0;
  bottom: 0;
  margin: auto 0;
  border: 1px solid black;
  box-shadow: 2px 2px 4px 1px rgba(0, 0, 0, 0.75);

  ${(props) =>
    props.action === 'NEXT'
      ? `
    right: 8px;
  `
      : 'left: 8px;'};

  &:active {
    transform: scale(0.98);
  }
`

const ImageModal = ({ jobId, handleClose }: IProps) => {
  const ref = useRef<any>(null)
  const [componentState, setComponentState] = useComponentState({
    initialLoad: true,
    id: null,
    jobId,
    base64String: null,
    loading: true,
    prompt: null,
    steps: null,
    cfg_scale: null,
    sampler: null,
    model: null,
    seed: null,
    containerHeight: 512,
    imageMaxHeight: 700,
    mouseHover: false
  })

  const fetchImageDetails = useCallback(
    async (buttonType: string = '', id: number = 0) => {
      let data = {
        id: null,
        jobId: null,
        base64String: null,
        prompt: null,
        steps: null,
        cfg_scale: null,
        sampler: null,
        models: [''],
        seed: null
      }

      if (buttonType === 'prev') {
        data = (await getPrevImageDetails(id)) || {}
      } else if (buttonType === 'next') {
        data = (await getNextImageDetails(id)) || {}
      } else {
        data = (await getImageDetails(componentState.jobId)) || {}
      }

      const { base64String, jobId, prompt } = data

      if (!data.id) {
        setComponentState({
          initialLoad: false,
          loading: false
        })
        return
      }

      setComponentState({
        initialLoad: false,
        loading: false,
        id: data.id,
        jobId,
        base64String,
        prompt,
        steps: data.steps,
        cfg_scale: data.cfg_scale,
        sampler: data.sampler,
        model: data.models[0],
        seed: data.seed
      })
    },
    [componentState.jobId, setComponentState]
  )

  const handleLoadMore = useCallback(
    async (btn: string) => {
      setComponentState({
        loading: true
      })

      if (btn === 'prev') {
        fetchImageDetails('prev', componentState.id)
      } else {
        fetchImageDetails('next', componentState.id)
      }
    },
    [componentState.id, fetchImageDetails, setComponentState]
  )

  useEffect(() => {
    if (jobId) {
      fetchImageDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.keyCode === 37) {
        //left
        handleLoadMore('prev')
      } else if (e.keyCode === 39) {
        // right
        handleLoadMore('next')
      } else if (e.keyCode == 27) {
        // esc
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleClose, handleLoadMore, setComponentState])

  useEffect(() => {
    if (ref?.current?.clientHeight) {
      setTimeout(() => {
        let containerHeight = ref?.current?.clientHeight ?? 0
        let imageHeight = containerHeight

        if (window.innerHeight <= containerHeight) {
          containerHeight = window.innerHeight - 80
          imageHeight = window.innerHeight - 170
        }

        setComponentState({
          containerHeight: containerHeight,
          imageMaxHeight: imageHeight
        })
      }, 100)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentState.base64String])

  const ImageNavButton = ({ action = '' }) => {
    return (
      <NextPrevButton
        action={action}
        onClick={() => {
          if (action === 'NEXT') {
            fetchImageDetails('next', componentState.id)
          } else {
            fetchImageDetails('prev', componentState.id)
          }
        }}
      >
        {action === 'NEXT' ? (
          <ChevronRightIcon stroke="#000000" />
        ) : (
          <ChevronLeftIcon stroke="#000000" />
        )}
      </NextPrevButton>
    )
  }

  return (
    <StyledModal
      handleClose={handleClose}
      setDynamicHeight={componentState.containerHeight}
    >
      {componentState.initialLoad && (
        <ContentWrapper>
          <SpinnerV2 />
        </ContentWrapper>
      )}
      {!componentState.initialLoad && componentState.base64String && (
        <ContentWrapper ref={ref}>
          <NavContainer
          // onMouseEnter={() => setComponentState({ mouseHover: true })}
          // onMouseLeave={() => setComponentState({ mouseHover: false })}
          >
            <ImageContainer>
              <StyledImage
                src={'data:image/webp;base64,' + componentState.base64String}
              />
              <ImageNavButton action="PREV" />
              <ImageNavButton action="NEXT" />
              {componentState.loading && (
                <ImageOverlay>
                  <SpinnerV2 />
                </ImageOverlay>
              )}
            </ImageContainer>
          </NavContainer>
          <TextWrapper>{componentState.prompt}</TextWrapper>
          <ImageDetails>
            Steps: {componentState.steps} | Guidance: {componentState.cfg_scale}{' '}
            | Sampler: {componentState.sampler} | Model: {componentState.model}{' '}
            | Seed: {componentState.seed}
          </ImageDetails>
        </ContentWrapper>
      )}
    </StyledModal>
  )
}

export default ImageModal
