import { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import {
  getImageDetails,
  getNextImageDetails,
  getPrevImageDetails
} from '../../utils/db'
import SpinnerV2 from '../Spinner'
import InteractiveModal from '../UI/InteractiveModal/interactiveModal'
import ImageNavWrapper from './ImageNavWrapper'

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
          <ImageNavWrapper
            loading={componentState.loading}
            base64String={componentState.base64String}
            fetchImageDetails={fetchImageDetails}
            handleClose={handleClose}
            id={componentState.id}
            jobId={componentState.jobId}
          />
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
