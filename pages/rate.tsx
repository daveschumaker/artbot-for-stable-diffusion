/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon'
import SpinnerV2 from '../components/Spinner'
import StarRating from '../components/StarRating/starRating'
import Linker from '../components/UI/Linker'
import PageTitle from '../components/UI/PageTitle'
import { ANON_API_KEY, RATING_QUALITY_MAP } from '../constants'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import AppSettings from '../models/AppSettings'
import { clientHeader } from '../utils/appUtils'

const MAX_ERROR_COUNT = 30

const SubTitle = styled.div`
  font-size: 14px;
  padding-bottom: 8px;
`

const LinkDetails = styled.span`
  /* display: flex; */
  /* flex-direction: row; */
  /* column-gap: 4px; */
`

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 400px;
  position: relative;

  @media (min-width: 640px) {
    height: 512px;
  }
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
`

const Image = styled.img<{ pending?: boolean; status?: string }>`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
  filter: brightness(100%);
  transition: all 250ms ease-in-out;
  height: auto;
  width: auto;
  max-height: 400px;

  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;

  @media (min-width: 640px) {
    max-height: 512px;
    max-width: 512px;
  }

  ${(props) =>
    props.pending &&
    `
    filter: brightness(40%);
  `}

  ${(props) =>
    props.status === 'hide' &&
    `
    opacity: 1;
    position: absolute;
    transform: translateX(-500%);
  `}

    ${(props) =>
    props.status === 'stage' &&
    `
    transition: all 5ms ease-in-out;
    opacity: 0;
    position: absolute;
    transform: translateX(500%);
  `}

  ${(props) =>
    props.status === 'show' &&
    `
    opacity: 1;
    position: absolute;
    left: 0;
    right: 0;
    transition: all 250ms ease-in-out;
  `}
`

let activeImage = 0
let errorCount = 0
let imagePending = false
let ratingPending = false

const nextImageDetails = {
  datasetId: null,
  imageId: null,
  imageUrl: null
}

const Rate = () => {
  const DRAMA_MODE = false // ratings provider has disabled rating system for all UIs for some reason.
  const [componentState, setComponentState] = useComponentState({
    apiKey: '',
    activeStar: 0,
    showError: false,
    datasetId: '',
    imageId: null,
    imageUrl: '',
    imagesRated: 0,
    kudosEarned: 0,
    initialLoad: true,
    imagePending: false,
    ratingPending: false,

    rateImage: -Infinity,
    rateQuality: -Infinity,

    imageOneStatus: 'show',
    imageTwoStatus: 'stage',
    imageOneUrl: '',
    imageTwoUrl: ''
  })

  interface IFetchParams {
    getNextImage?: Boolean
  }

  const fetchImage = useCallback(
    async (options: IFetchParams = {}) => {
      const { getNextImage = false } = options

      let data: any = {}
      try {
        if (errorCount >= MAX_ERROR_COUNT) {
          setComponentState({
            initialLoad: false,
            imagePending: false,
            showError: true
          })
          return
        }

        const res = await fetch(
          'https://ratings.aihorde.net/api/v1/rating/new',
          {
            headers: {
              'Content-Type': 'application/json',
              'Client-Agent': clientHeader(),
              apikey: componentState.apiKey
            }
          }
        )
        data = (await res.json()) || {}
      } catch (err) {
        errorCount++
        setTimeout(() => {
          fetchImage({ getNextImage })
        }, 300)
        return
      } finally {
        if (data.id) {
          errorCount = 0

          if (getNextImage) {
            nextImageDetails.datasetId = data.dataset_id
            nextImageDetails.imageId = data.id
            nextImageDetails.imageUrl = data.url

            if (activeImage === 1) {
              setComponentState({
                imageTwoUrl: data.url
              })
            } else {
              setComponentState({
                imageOneUrl: data.url
              })
            }
          } else {
            activeImage = 1
            setComponentState({
              rateImage: -Infinity,
              rateQuality: -Infinity,
              datasetId: data.dataset_id,
              imageOneUrl: data.url,
              imageId: data.id,
              imageUrl: data.url,
              initialLoad: false,
              imagePending: false,
              showError: false
            })
          }
        }
      }
    },
    [componentState.apiKey, setComponentState]
  )

  const rateQuality = (rating: number) => {
    if (ratingPending) {
      return
    }

    setComponentState({
      rateQuality: rating
    })
  }

  const rateImage = useCallback(
    (rating: number) => {
      if (ratingPending) {
        return
      }

      setComponentState({
        rateImage: rating
      })
    },
    [setComponentState]
  )

  const loadNextImage = useCallback(() => {
    const updateState = {
      rateImage: -Infinity,
      rateQuality: -Infinity,
      initialLoad: false,
      imagePending: false,
      showError: false,
      ratingPending: false,

      imageOneStatus: '',
      imageTwoStatus: ''
    }

    if (activeImage === 1) {
      activeImage = 2
      ratingPending = false
      updateState.imageOneStatus = 'hide'
      updateState.imageTwoStatus = 'show'

      setTimeout(() => {
        setComponentState({
          imageOneStatus: 'stage'
        })
      }, 250)
    } else {
      activeImage = 1
      ratingPending = false
      updateState.imageOneStatus = 'show'
      updateState.imageTwoStatus = 'hide'

      setTimeout(() => {
        setComponentState({
          imageTwoStatus: 'stage'
        })
      }, 250)
    }

    setComponentState({
      ...updateState
    })
  }, [setComponentState])

  const rateImageRequest = useCallback(async () => {
    if (ratingPending) {
      return
    }

    if (componentState.rateImage < 0 || componentState.rateQuality < 0) {
      return
    }

    ratingPending = true

    setComponentState({
      imagePending: true,
      ratingPending: true
    })

    const ratingData = {
      artifacts: RATING_QUALITY_MAP[componentState.rateQuality],
      rating: componentState.rateImage
    }

    try {
      const res = await fetch(
        `https://ratings.droom.cloud/api/v1/rating/${componentState.imageId}`,
        {
          method: 'POST',
          body: JSON.stringify(ratingData),
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader(),
            apikey: componentState.apiKey
          }
        }
      )

      const data = await res.json()
      fetchImage({ getNextImage: true })
      const { reward } = data

      if (reward) {
        let totalRated = AppSettings.get('imagesRated') || 0
        let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0
        totalRated++
        kudosEarned += reward

        if (componentState.apiKey !== ANON_API_KEY) {
          AppSettings.save('imagesRated', totalRated)
          AppSettings.save('kudosEarnedByRating', kudosEarned)
        }

        errorCount = 0
        setComponentState({
          imagesRated: totalRated,
          kudosEarned,
          showError: false
        })

        loadNextImage()
      }
    } catch (err) {
      errorCount++
      setTimeout(() => {
        ratingPending = false
        rateImageRequest()
      }, 300)
    }
  }, [
    componentState.apiKey,
    componentState.imageId,
    componentState.rateImage,
    componentState.rateQuality,
    fetchImage,
    loadNextImage,
    setComponentState
  ])

  useEffect(() => {
    let totalRated = AppSettings.get('imagesRated') || 0
    let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0

    setComponentState({
      imagesRated: totalRated,
      kudosEarned
    })
  }, [setComponentState])

  useEffectOnce(() => {
    activeImage = 0
    errorCount = 0

    imagePending = false
    ratingPending = false
  })

  useEffect(() => {
    if (
      componentState.rateImage === -Infinity ||
      componentState.rateQuality === -Infinity
    ) {
      return
    }

    rateImageRequest()
  }, [componentState.rateImage, componentState.rateQuality, rateImageRequest])

  // Neet to set API key on initial load
  useEffect(() => {
    setComponentState({ apiKey: AppSettings.get('apiKey') || ANON_API_KEY })
  }, [setComponentState])

  useEffect(() => {
    if (imagePending) {
      return
    }

    if (componentState.apiKey && !imagePending) {
      setTimeout(() => {
        fetchImage().then(() => {
          fetchImage({ getNextImage: true })
        })
      }, 250)
    }
  }, [componentState.apiKey, fetchImage])

  if (DRAMA_MODE) {
    return (
      <>
        <Head>
          <title>Rate images - ArtBot for Stable Diffusion</title>
          <meta name="twitter:title" content="Rate images with ArtBot" />
          <meta
            name="twitter:description"
            content="Give aesthetics ratings for images created with Stable Diffusion and help improve future models."
          />
          <meta
            name="twitter:image"
            content="https://tinybots.net/artbot/robot_judge.png"
          />
        </Head>
        <PageTitle>Rate images (disabled)</PageTitle>
        <SubTitle>
          <div className="mb-[8px]">
            <strong>March 1st, 2023</strong>
          </div>
          Due to issues with third-party rating service that are outside of
          ArtBot&apos; control, ratings have been (temporarily?) disabled. I
          will share here when I have more information.
        </SubTitle>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Rate images - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="Rate images with ArtBot" />
        <meta
          name="twitter:description"
          content="Give aesthetics ratings for images created with Stable Diffusion and help improve future models."
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robot_judge.png"
        />
      </Head>
      <PageTitle>Rate images</PageTitle>
      {componentState.apiKey === ANON_API_KEY && (
        <>
          <SubTitle>
            Log in with your API key on the{' '}
            <Linker href="/settings">settings page</Linker> to receive{' '}
            <Linker href="/faq#kudos" passHref>
              kudos
            </Linker>{' '}
            awards for rating images.
          </SubTitle>
          <SubTitle>
            Don&apos;t have a Stable Horde account?{' '}
            <Linker
              href="https://stablehorde.net/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkDetails className="flex flex-row gap-2 items-center">
                Create one here
                <ExternalLinkIcon />
              </LinkDetails>
            </Linker>
          </SubTitle>
        </>
      )}
      {componentState.showError && (
        <div className="text-red-500 font-bold flex flex-row gap-2">
          ERROR: Unable to complete this request. Please try again later.
        </div>
      )}
      {componentState.initialLoad && (
        <>
          <SubTitle>Loading new image...</SubTitle>
          <SubTitle>
            <SpinnerV2 />
          </SubTitle>
        </>
      )}

      {!componentState.initialLoad && componentState.imageUrl ? (
        <div>
          <div className="flex flex-col align-center items-center w-full overflow-x-hidden">
            <ImageContainer>
              <Image
                status={componentState.imageOneStatus}
                pending={componentState.imagePending}
                src={componentState.imageOneUrl}
                alt="Rate this image"
              />
              <Image
                status={componentState.imageTwoStatus}
                pending={componentState.imagePending}
                src={componentState.imageTwoUrl}
                alt="Rate this image"
              />
              {componentState.imagePending && (
                <ImageOverlay>
                  <SpinnerV2 />
                </ImageOverlay>
              )}
            </ImageContainer>
            <div className="mt-2 flex flex-col align-center items-center w-full">
              <div>
                How much do <em>you</em> like this image?
              </div>
              <div className="flex flex-row items-center gap-2">
                <span className="text-xs">worst</span>
                <StarRating
                  disabled={componentState.ratingPending}
                  onStarClick={rateImage}
                />
                <span className="text-xs">best</span>
              </div>
            </div>
            <div className="mt-2 flex flex-col align-center items-center w-full">
              <div>Image quality? (flaws, artifacts, etc)</div>
              <div className="flex flex-row items-center gap-2">
                <span className="text-xs">worst</span>
                <StarRating
                  count={6}
                  disabled={componentState.ratingPending}
                  onStarClick={rateQuality}
                  startValue={0}
                />
                <span className="text-xs">best</span>
              </div>
            </div>
          </div>
          {componentState.apiKey !== ANON_API_KEY && (
            <div className="mb-2 mt-2 flex flex-row gap-2 text-sm">
              <div>Images rated: {componentState.imagesRated}</div>
              <div>Kudos earned: {componentState.kudosEarned}</div>
            </div>
          )}
        </div>
      ) : null}
      {componentState.apiKey !== ANON_API_KEY && (
        <SubTitle>
          Earn{' '}
          <Linker href="/faq#kudos" passHref>
            kudos
          </Linker>{' '}
          by rating images based on aesthetic preferences. This system will help{' '}
          <Linker
            href="https://laion.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <>LAION</>
          </Linker>{' '}
          (the non-profit which helped trained Stable Diffusion) improve their
          library.
        </SubTitle>
      )}
    </>
  )
}

export default Rate
