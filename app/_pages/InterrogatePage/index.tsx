'use client'

/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from 'app/_components/Button'
import Input from 'app/_components/Input'
import PageTitle from 'app/_components/PageTitle'

import useComponentState from 'app/_hooks/useComponentState'
import { requestIterrogate } from 'app/_api/requestInterrogate'
import SpinnerV2 from 'app/_components/Spinner'
import { checkInterrogate } from 'app/_api/checkInterrogate'
import Checkbox from 'app/_components/Checkbox'
import Linker from 'app/_components/Linker'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'

import AppSettings from 'app/_data-models/AppSettings'
import { useRouter, useSearchParams } from 'next/navigation'
import { getImageForInterrogation } from 'app/_utils/interrogateUtils'
import { clientHeader } from 'app/_utils/appUtils'
import FlexRow from 'app/_components/FlexRow'
import { basePath } from 'BASE_PATH'
import { IconAlertTriangle, IconPlus, IconRecycle } from '@tabler/icons-react'
import Dropzone from 'app/_modules/Dropzone'
import TextButton from 'app/_components/TextButton'

const ContentWrapper = styled.div`
  padding-top: 16px;
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

const InterrogatePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  let source_image = ''
  let sourceType = SourceType.none
  if (searchParams?.get('user-share') === 'true') {
    sourceType = SourceType.upload
    source_image = getImageForInterrogation()
  }

  const initState = {
    apiError: '',
    imgUrl: '',
    interrogationType: { value: 'caption', label: 'Caption' },
    jobId: '',
    jobComplete: false,
    jobPending: false,
    loadImageError: false,
    sourceType: sourceType,
    source_image: source_image,
    sourceImageType: '',
    queuedWork: null,
    results: {
      caption: '',
      nsfw: null,
      tags: {}
    },
    interrogations: {
      caption:
        (AppSettings.get(`interrogationSetting-caption`) !== true &&
          AppSettings.get(`interrogationSetting-caption`)) !== false
          ? true
          : AppSettings.get(`interrogationSetting-caption`),
      tags: AppSettings.get(`interrogationSetting-tags`) || false,
      nsfw: AppSettings.get(`interrogationSetting-nsfw`) || false
    },
    workers: null
  }

  const [componentState, setComponentState] = useComponentState({
    ...initState
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
    try {
      const resp = await fetch(`${basePath}/api/img-from-url`, {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: componentState.imgUrl
        }),
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
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
      } else {
        setComponentState({
          loadImageError: true
        })
      }
    } catch (err) {
      console.log(`Error: Unable to load image.`)
      console.log(err)
      setComponentState({
        loadImageError: true
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

      const { jobId, success, message } = data

      if (!success) {
        setComponentState({
          apiError: message,
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

  useEffectOnce(() => {
    if (searchParams?.get('user-share') === 'true') {
      submitInterrogation({
        source_image: getImageForInterrogation()
      })
    } else {
      setComponentState({ ...initState })
    }
  })

  const fetchHordeStatus = useCallback(async () => {
    const res = await fetch('https://aihorde.net/api/v2/status/performance', {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      }
    })
    const data = (await res.json()) || {}

    const { interrogator_count, queued_forms } = data

    if (interrogator_count >= 0) {
      setComponentState({
        queuedWork: queued_forms,
        workers: data.interrogator_count
      })
    }
  }, [setComponentState])

  useEffectOnce(() => {
    fetchHordeStatus()
  })

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

    AppSettings.set(
      `interrogationSetting-${type}`,
      !componentState.interrogations[type]
    )

    setComponentState({ interrogations })
  }

  return (
    <>
      <PageTitle>Interrogate Image (img2text)</PageTitle>
      {componentState.workers === 0 ? (
        <SubSectionTitle>
          <div className="flex flex-row items-center text-amber-500">
            <IconAlertTriangle size={32} /> Warning: There are currently no
            workers available to process interrogation requests.
          </div>
        </SubSectionTitle>
      ) : null}
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
          checked={componentState.interrogations.caption}
          onChange={() => handleCheckboxClick('caption')}
        />
        <Checkbox
          label="Interrogation"
          checked={componentState.interrogations.tags}
          onChange={() => handleCheckboxClick('tags')}
        />
        <Checkbox
          label="NSFW"
          checked={componentState.interrogations.nsfw}
          onChange={() => handleCheckboxClick('nsfw')}
        />
      </OptionsWrapper>
      {componentState.jobComplete && (
        <Section>
          <div className="flex flex-row gap-2">
            <Button
              onClick={() => {
                setComponentState({ ...initState })
                router.replace('/interrogate')
              }}
            >
              <IconPlus />
              New
            </Button>
            <Button
              onClick={() => {
                submitInterrogation({
                  source_image: componentState.source_image
                })
              }}
            >
              <IconRecycle /> Retry?
            </Button>
          </div>
        </Section>
      )}
      {searchParams?.get('user-share') === 'true' && (
        <Section>
          <SubSectionTitle>
            <strong>Interrogate image from your library</strong>
          </SubSectionTitle>
          <div>
            <img
              alt={componentState.results.caption}
              src={`data:${componentState.sourceImageType};base64,${componentState.source_image}`}
            />
          </div>
        </Section>
      )}
      {!componentState.jobPending && !componentState.jobComplete && (
        <Section>
          <SubSectionTitle>
            <strong>Upload an image from a URL</strong>
          </SubSectionTitle>
          <FlexRow pb={8}>
            <span style={{ lineHeight: '40px', marginRight: '16px' }}>
              URL:
            </span>
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
              theme="primary"
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
        </Section>
      )}

      <Section>
        <ContentWrapper>
          {componentState.apiError && (
            <>
              <div className="mb-2 text-lg font-bold text-red-500">
                {componentState.apiError}
              </div>
            </>
          )}
          {componentState.jobPending && (
            <Section>
              <SubSectionTitle>
                <strong>Waiting for interrogation results</strong>
              </SubSectionTitle>
              <SpinnerV2 />
            </Section>
          )}
          {componentState.jobComplete &&
            componentState.sourceImageType &&
            componentState.source_image && (
              <Section>
                <SubSectionTitle>
                  <strong>Image interrogation results</strong>
                </SubSectionTitle>
                <div>
                  <img
                    alt={componentState.results.caption}
                    src={`data:${componentState.sourceImageType};base64,${componentState.source_image}`}
                  />
                </div>
              </Section>
            )}
          {componentState.jobComplete &&
            componentState.interrogations.caption === true && (
              <div className="mt-2">
                <PageTitle as="h2">Image caption</PageTitle>
                &quot;{componentState.results.caption}
                &quot;
                <div className="mt-2">
                  <TextButton
                    onClick={() => {
                      router.push(
                        `/create?prompt=${encodeURIComponent(
                          componentState.results.caption
                        )}`
                      )
                    }}
                  >
                    use prompt?
                  </TextButton>
                </div>
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

export default InterrogatePage
