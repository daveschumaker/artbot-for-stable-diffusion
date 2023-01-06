/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import PageTitle from '../../components/UI/PageTitle'
import Dropzone from '../../components/Dropzone'
import useComponentState from '../../hooks/useComponentState'
import { requestIterrogate } from '../../api/requestInterrogate'
import SpinnerV2 from '../Spinner'
import { checkInterrogate } from '../../api/checkInterrogate'
import Head from 'next/head'
import Checkbox from '../UI/Checkbox'
import Linker from '../UI/Linker'

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

const OptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`

const ListItem = styled.li`
  font-size: 14px;
  padding-left: 16px;
  padding-top: 8px;
`

enum SourceType {
  none = 'none',
  url = 'url',
  upload = 'upload'
}

const Interrogate = () => {
  const [componentState, setComponentState] = useComponentState({
    apiError: '',
    imgUrl: '',
    interrogationType: { value: 'caption', label: 'Caption' },
    jobId: '',
    jobComplete: false,
    jobPending: false,
    sourceType: SourceType.none,
    source_image: '',
    sourceImageType: '',
    results: {
      caption: '',
      nsfw: null,
      tags: {}
    },
    interrogations: {
      caption: true,
      tags: false,
      nsfw: false
    }
  })

  const validOptions = useCallback(() => {
    if (componentState.interrogations.caption) {
      return true
    }

    if (componentState.interrogations.tags) {
      return true
    }

    if (componentState.interrogations.nsfw) {
      return true
    }

    return false
  }, [
    componentState.interrogations.caption,
    componentState.interrogations.nsfw,
    componentState.interrogations.tags
  ])

  const fetchRemoteImage = useCallback(async () => {
    const resp = await fetch(`/artbot/api/img-from-url`, {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: componentState.imgUrl
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await resp.json()

    // @ts-ignore
    const { success, imageType, imgBase64String } = data

    if (success) {
      setComponentState({
        source_image: imgBase64String,
        sourceImageType: imageType
      })
    }
  }, [componentState.imgUrl, setComponentState])

  const checkInterrogationStatus = useCallback(async () => {
    try {
      const data = await checkInterrogate(componentState.jobId)
      const { state, forms = [] } = data

      if (state === 'faulted') {
        setComponentState({
          apiError: 'Unable to check image request...',
          jobComplete: false,
          jobPending: false
        })

        return
      }

      if (state === 'done') {
        const baseState = {
          caption: '',
          nsfw: null,
          tags: {}
        }

        forms.forEach((obj: any) => {
          if (obj.form === 'caption') {
            const { result = {} } = obj
            const { caption } = result
            baseState.caption = caption
          }

          if (obj.form === 'interrogation') {
            const { result = {} } = obj
            const { interrogation = {} } = result
            baseState.tags = { ...interrogation }
          }

          if (obj.form === 'nsfw') {
            const { result = {} } = obj
            const { nsfw = false } = result
            baseState.nsfw = nsfw
          }
        })

        setComponentState({
          jobComplete: true,
          jobPending: false,
          results: Object.assign({}, baseState)
        })

        if (componentState.sourceType === SourceType.url) {
          await fetchRemoteImage()
        }
      }
    } catch (err) {
      setComponentState({
        apiError: 'Unable to check image request...',
        jobComplete: false,
        jobPending: false
      })
    }
  }, [
    componentState.jobId,
    componentState.sourceType,
    fetchRemoteImage,
    setComponentState
  ])

  const submitInterrogation = async ({
    source_image
  }: {
    source_image: string
  }) => {
    if (!validOptions()) {
      setComponentState({
        apiError: 'Please select a valid interrogation option.'
      })
      return
    }

    setComponentState({
      apiError: '',
      jobComplete: false,
      jobPending: true,
      results: {
        caption: '',
        nsfw: null,
        tags: {}
      }
    })

    try {
      const interrogationTypes = []

      if (componentState.interrogations.caption) {
        interrogationTypes.push({
          name: 'caption'
        })
      }

      if (componentState.interrogations.tags) {
        interrogationTypes.push({
          name: 'interrogation'
        })
      }

      if (componentState.interrogations.nsfw) {
        interrogationTypes.push({
          name: 'nsfw'
        })
      }

      const data = await requestIterrogate({
        interrogationTypes,
        source_image
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

  const handleRequest = ({ imageType = '', source_image = '' }) => {
    if (!validOptions()) {
      setComponentState({
        apiError: 'Please select a valid interrogation option.'
      })
      return
    }

    setComponentState({
      sourceType: SourceType.upload,
      source_image,
      sourceImageType: imageType
    })

    submitInterrogation({ source_image })
  }

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

    Object.keys(componentState.results.tags).forEach((key) => {
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
        <InterrogationKey key={key}>
          {formatKey.charAt(0).toUpperCase() + formatKey.slice(1)}
        </InterrogationKey>
      )

      componentState.results.tags[key].forEach((obj: any = {}) => {
        elements.push(
          <InterrogationTag key={obj.text + '_' + obj.confidence}>
            {obj.text} ({Number(obj.confidence).toFixed(2)}%)
          </InterrogationTag>
        )
      })
    })

    return elements
  }

  const handleCheckboxClick = (type: string) => {
    const interrogations = Object.assign({}, componentState.interrogations)
    interrogations[type] = !componentState.interrogations[type]

    setComponentState({ interrogations })
  }

  return (
    <>
      <Head>
        <title>ArtBot - Interrogate Image (img2text)</title>
      </Head>
      <PageTitle>Interrogate Image (img2text)</PageTitle>
      <SubSectionTitle>
        Discover AI generated descriptions, suggested tags, or even predicted
        NSFW status for a given image. For more information,{' '}
        <Linker
          href="https://dbzer0.com/blog/image-interrogations-are-now-available-on-the-stable-horde/"
          target="_blank"
          rel="noopener noreferrer"
        >
          read db0&apos;s blog
        </Linker>{' '}
        (creator of Stable Horde) about image interrogation.
      </SubSectionTitle>
      <OptionsWrapper>
        <SubSectionTitle>
          <strong>Select interrogation types</strong>
          <ul>
            <ListItem>
              <strong>Caption</strong>: Attempts to generate a caption that best
              describes an image.
            </ListItem>
            <ListItem>
              <strong>Interrogation</strong>: Attempts to generate a list of
              words and confidence levels that describe an image.
            </ListItem>
            <ListItem>
              <strong>NSFW</strong>: Attempts to predict if a given image is
              NSFW.
            </ListItem>
          </ul>
        </SubSectionTitle>
        <Checkbox
          label="Caption"
          value={componentState.interrogations.caption}
          onChange={() => handleCheckboxClick('caption')}
        />
        <Checkbox
          label="Interrogation"
          value={componentState.interrogations.tags}
          onChange={() => handleCheckboxClick('tags')}
        />
        <Checkbox
          label="NSFW"
          value={componentState.interrogations.nsfw}
          onChange={() => handleCheckboxClick('nsfw')}
        />
      </OptionsWrapper>
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
              setComponentState({
                imgUrl: e.target.value,
                sourceType: SourceType.url
              })
            }
            value={componentState.imgUrl}
            width="100%"
          />
          <Button
            title="Upload image from URL"
            btnType="primary"
            onClick={() =>
              submitInterrogation({ source_image: componentState.imgUrl })
            }
            width="120px"
            disabled={componentState.jobPending}
          >
            {componentState.jobPending ? 'Loading...' : 'Send'}
          </Button>
        </FlexRow>
        <Dropzone handleUpload={handleRequest} type={'interrogate'} />
        <ContentWrapper>
          {componentState.apiError && (
            <>
              <div className="mb-2 text-red-500 text-lg font-bold">
                {componentState.apiError}
              </div>
            </>
          )}
          {componentState.jobPending && <SpinnerV2 />}
          {componentState.jobComplete && (
            <>
              <div className="mb-2">------------</div>
            </>
          )}
          {componentState.jobComplete &&
            componentState.sourceImageType &&
            componentState.source_image && (
              <div>
                <img
                  alt={componentState.results.caption}
                  src={`data:${componentState.sourceImageType};base64,${componentState.source_image}`}
                />
              </div>
            )}
          {componentState.jobComplete &&
            componentState.interrogations.caption === true && (
              <div className="mt-2">
                <PageTitle as="h2">Image caption</PageTitle>
                &quot;{componentState.results.caption}
                &quot;
              </div>
            )}
          {componentState.jobComplete &&
            componentState.results.nsfw !== null && (
              <div className="mt-2">
                <PageTitle as="h2">NSFW prediction</PageTitle>
                {componentState.results.nsfw ? (
                  <>
                    Image is predicted to be <b>NOT SAFE FOR WORK</b>.
                  </>
                ) : (
                  <>
                    Image is predicted to be <strong>safe for work</strong>.
                  </>
                )}
              </div>
            )}
          {componentState.jobComplete &&
            componentState.interrogations.tags === true && (
              <div className="mt-2">
                <PageTitle as="h2">Image tags</PageTitle>
                {renderInterrogationKeys()}
              </div>
            )}
        </ContentWrapper>
      </Section>
    </>
  )
}

export default Interrogate
