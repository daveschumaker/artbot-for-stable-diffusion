import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import PageTitle from '../../components/UI/PageTitle'
// import Dropzone from '../../components/Dropzone'
import Select from '../../components/UI/Select'
import useComponentState from '../../hooks/useComponentState'
import { requestIterrogate } from '../../api/requestInterrogate'
import SpinnerV2 from '../Spinner'
import { checkInterrogate } from '../../api/checkInterrogate'
import Head from 'next/head'

interface FlexRowProps {
  bottomPadding?: number
}

const ContentWrapper = styled.div`
  padding-top: 16px;
`

const FlexRow = styled.div<FlexRowProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;

  ${(props) =>
    props.bottomPadding &&
    `
    padding-bottom: ${props.bottomPadding}px;
  `}
`

const Section = styled.div`
  padding-top: 16px;
  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

interface MaxWidthProps {
  maxWidth: number
}

const MaxWidth = styled.div<MaxWidthProps>`
  width: 100%;

  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth}px;
  `}
`

const InterrogationKey = styled.div`
  font-size: 16px;
  font-weight: 700;

  padding-top: 8px;
  &:first-child {
    padding-top: 0;
  }
`

const InterrogationTag = styled.div`
  font-size: 14px;
  padding-left: 16px;
`

const Interrogate = () => {
  const [componentState, setComponentState] = useComponentState({
    apiError: '',
    imgUrl: '',
    interrogation: {}, // API response
    interrogationType: { value: 'caption', label: 'Caption' },
    jobId: '',
    jobComplete: false,
    jobPending: false,
    nsfw: false, // API response
    source_image: '',
    caption: '' // API response
  })

  const checkInterrogationStatus = useCallback(async () => {
    try {
      const data = await checkInterrogate(componentState.jobId)
      const { state, forms = [] } = data

      if (
        state === 'done' &&
        componentState.interrogationType.value === 'caption'
      ) {
        const [form = {}] = forms
        const { result = {} } = form
        const { caption } = result

        setComponentState({
          caption,
          jobComplete: true,
          jobPending: false
        })
      }

      if (
        state === 'done' &&
        componentState.interrogationType.value === 'nsfw'
      ) {
        const [form = {}] = forms
        const { result = {} } = form
        const { nsfw } = result

        setComponentState({
          nsfw,
          jobComplete: true,
          jobPending: false
        })
      }

      if (
        state === 'done' &&
        componentState.interrogationType.value === 'interrogation'
      ) {
        const [form = {}] = forms
        const { result = {} } = form
        const { interrogation = {} } = result

        setComponentState({
          interrogation: { ...interrogation },
          jobComplete: true,
          jobPending: false
        })
      }
    } catch (err) {
      setComponentState({
        apiError: 'Unable to check image request...',
        jobComplete: false,
        jobPending: false
      })
    }
  }, [
    componentState.interrogationType.value,
    componentState.jobId,
    setComponentState
  ])

  const submitInterrogation = async () => {
    setComponentState({
      apiError: '',
      caption: '',
      jobComplete: false,
      jobPending: true
    })

    try {
      const data = await requestIterrogate({
        interrogationType: componentState.interrogationType.value,
        source_image: componentState.imgUrl
      })

      const { jobId, success } = data

      if (!success) {
        setComponentState({
          apiError: 'Unable to complete request, please try again later.',
          jobPending: false
        })
      } else {
        setComponentState({
          apiError: '',
          jobId
          // jobPending: false
        })
      }
    } catch (err) {
      setComponentState({
        jobPending: false
      })
    }
  }

  // const handleRequest = () => {}

  useEffect(() => {
    let interval: any

    if (componentState.jobPending === true && componentState.jobId) {
      interval = setInterval(() => {
        checkInterrogationStatus()
      }, 6500)
    }

    return () => clearInterval(interval)
  }, [
    checkInterrogationStatus,
    componentState.jobId,
    componentState.jobPending
  ])

  const renderInterrogationKeys = () => {
    const sortedKeys: any = []
    const elements: any = []

    Object.keys(componentState.interrogation).forEach((key) => {
      sortedKeys.push(key)
    })

    sortedKeys.sort((a: string, b: string) => {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }

      return 0
    })

    sortedKeys.forEach((key: string) => {
      let formatKey = key.charAt(0).toUpperCase() + key.slice(1)
      elements.push(
        <InterrogationKey>
          {formatKey.charAt(0).toUpperCase() + formatKey.slice(1)}
        </InterrogationKey>
      )

      componentState.interrogation[key].forEach((obj: any = {}) => {
        elements.push(
          <InterrogationTag>
            {obj.text} ({Number(obj.confidence).toFixed(2)}%)
          </InterrogationTag>
        )
      })
    })

    return elements
  }

  return (
    <>
      <Head>
        <title>ArtBot - Interrogate Image</title>
      </Head>
      <PageTitle>Interrogate Image</PageTitle>
      <Section>
        <SubSectionTitle>
          <strong>Interrogation type</strong>
          <div className="block text-xs mb-2 w-full">
            {componentState.interrogationType.value === 'caption' && (
              <>
                Caption: Attempts to generate a caption that best describes an
                image.
              </>
            )}
            {componentState.interrogationType.value === 'interrogation' && (
              <>
                Interrogation: Attempts to generate a list of words and
                confidence levels that describe an image.
              </>
            )}
            {componentState.interrogationType.value === 'nsfw' && (
              <>Interrogation: Attempts to determine if an image is NSFW.</>
            )}
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          maxWidth="240"
        >
          <Select
            options={[
              { value: 'caption', label: 'Caption' },
              { value: 'interrogation', label: 'Interrogation' },
              { value: 'nsfw', label: 'NSFW' }
            ]}
            onChange={(interrogationType: any) => {
              setComponentState({ interrogationType })
            }}
            value={componentState.interrogationType}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Upload an image from a URL</strong>
        </SubSectionTitle>
        <FlexRow bottomPadding={8}>
          <span style={{ lineHeight: '40px', marginRight: '16px' }}>URL:</span>
          <Input
            className="mb-2"
            type="text"
            name="img-url"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setComponentState({ imgUrl: e.target.value })
            }
            value={componentState.imgUrl}
            width="100%"
          />
          <Button
            title="Upload image from URL"
            btnType="primary"
            onClick={submitInterrogation}
            width="120px"
            disabled={componentState.jobPending}
          >
            {componentState.jobPending ? 'Loading...' : 'Send'}
          </Button>
        </FlexRow>
        {/* <Dropzone handleUpload={handleRequest} type={'interrogate'} /> */}
        <ContentWrapper>
          {componentState.apiError && (
            <div className="mb-2 text-red-500 text-lg font-bold">
              {componentState.apiError}
            </div>
          )}
          {componentState.jobPending && <SpinnerV2 />}
          {componentState.jobComplete &&
            componentState.interrogationType.value === 'caption' && (
              <>
                <div className="mb-2">------------</div>
                <PageTitle as="h2">Image caption</PageTitle>
                <strong>Caption:</strong> &quot;{componentState.caption}&quot;
              </>
            )}
          {componentState.jobComplete &&
            componentState.interrogationType.value === 'nsfw' && (
              <>
                <div className="mb-2">------------</div>
                <PageTitle as="h2">NSFW prediction</PageTitle>
                {componentState.nsfw ? (
                  <>
                    Image is predicted to be <b>NOT SAFE FOR WORK</b>.
                  </>
                ) : (
                  <>
                    Image is predicted to be <strong>safe for work</strong>.
                  </>
                )}
              </>
            )}
          {componentState.jobComplete &&
            componentState.interrogationType.value === 'interrogation' && (
              <>
                <div className="mb-2">------------</div>
                <PageTitle as="h2">Image tags</PageTitle>
                {renderInterrogationKeys()}
              </>
            )}
        </ContentWrapper>
      </Section>
    </>
  )
}

export default Interrogate
