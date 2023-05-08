/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useStore } from 'statery'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { trackEvent } from '../api/telemetry'
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon'
import SpinnerV2 from '../components/Spinner'
import StarRating from '../components/StarRating/starRating'
import Linker from '../components/UI/Linker'
import PageTitle from '../components/UI/PageTitle'
import { ANON_API_KEY, RATING_API, RATING_QUALITY_MAP } from '../_constants'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import AppSettings from '../models/AppSettings'
import { userInfoStore } from '../store/userStore'
import { clientHeader } from '../utils/appUtils'
import { sleep } from 'utils/sleep'
import { NewRating } from 'types'

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

let errorCount = 0
let imagePending = false
let ratingPending = false
let ratingTime = Date.now()

let lastRatedId: string

const Rate = () => {
  const DRAMA_MODE = false // ratings provider has disabled rating system for all UIs for some reason.
  const userStore = useStore(userInfoStore)
  const { sharedKey } = userStore
  const [imageArray, setImageArray] = useState<Array<NewRating>>([])

  const [componentState, setComponentState] = useComponentState({
    apiKey: '',
    activeStar: 0,
    showError: false,
    datasetId: '',
    imageId: null,
    imageUrl: '',

    errorMessage: '',

    imagesRated: 0,
    kudosEarned: 0,

    initialLoad: true,
    imagePending: false,
    ratingPending: false,

    rateImage: -Infinity,
    rateQuality: -Infinity
  })

  interface IFetchParams {
    getNextImage?: Boolean
    ratingError?: Boolean
  }

  const loadNextImage = useCallback(() => {
    const updateState = {
      rateImage: -Infinity,
      rateQuality: -Infinity,
      initialLoad: false,
      showError: false
    }

    setComponentState({
      ...updateState
    })
  }, [setComponentState])

  const fetchImage = useCallback(
    async (options: IFetchParams = {}): Promise<Boolean> => {
      const { ratingError = false, getNextImage = false } = options

      if (ratingError) {
        const updateImageArray = [...imageArray]
        updateImageArray.shift() // Remove first rating.
        setImageArray(updateImageArray)
        setComponentState({ imagePending: false, ratingPending: false })
        return false
      }

      if (imageArray.length >= 2) {
        return false
      }

      let data: NewRating
      try {
        if (errorCount >= MAX_ERROR_COUNT) {
          setComponentState({
            initialLoad: false,
            imagePending: false,
            showError: true
          })
          return false
        }

        const res = await fetch(`${RATING_API}/api/v1/rating/new`, {
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader(),
            apikey: componentState.apiKey
          }
        })

        if (res.status === 403) {
          loadNextImage()
          fetchImage()
          return false
        }

        if (res.status === 429) {
          setComponentState({
            errorMessage:
              'Whoa! Too many requests. Try again in a minute or so.'
          })
          return false
        }

        data = (await res.json()) || {}

        const updateImageArray = [...imageArray]
        if (data.id) {
          if (updateImageArray[0] && updateImageArray[0].id === data.id) {
            return false
          }

          if (!getNextImage) {
            updateImageArray.shift() // Remove first rating.
          }

          updateImageArray.push(data)
          setImageArray(updateImageArray)

          if (componentState.initialLoad) {
            setComponentState({ initialLoad: false })
          }
        }

        setTimeout(() => {
          imagePending = false
          ratingPending = false
          setComponentState({ imagePending: false, ratingPending: false })
        }, 600)

        // await sleep(300)
        return true
      } catch (err) {
        errorCount++
        setTimeout(() => {
          fetchImage({ getNextImage })
        }, 300)
        return false
      }
    },
    [
      componentState.apiKey,
      componentState.initialLoad,
      imageArray,
      loadNextImage,
      setComponentState
    ]
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

    const imageId = imageArray[0].id
    lastRatedId = imageId

    try {
      const res = await fetch(`${RATING_API}/api/v1/rating/${imageId}`, {
        method: 'POST',
        body: JSON.stringify(ratingData),
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader(),
          apikey: componentState.apiKey
        }
      })

      if (res.status === 403) {
        console.log(`Rate Image Error?!`)
        loadNextImage()
        fetchImage()
      }

      const data = await res.json()
      fetchImage()
      const { reward } = data

      if (reward) {
        let newTime = Date.now()
        let timeDiff = (newTime - ratingTime) / 1000
        ratingTime = newTime

        trackEvent({
          event: 'RATED_EXTERNAL_IMAGE',
          data: {
            imageId: imageId,
            loggedIn: userInfoStore.state.loggedIn,
            timeBetweenSec: Math.round(timeDiff * 100) / 100,
            rating: ratingData.rating,
            artifacts: ratingData.artifacts
          }
        })

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

        await sleep(1000)
        // fetchImage({ getNextImage: true }) // Try to fetch an additional image, if possible.
      }
    } catch (err: any) {
      errorCount++
      trackEvent({
        event: 'RATE_IMAGE_ERROR',
        data: {
          imageId: imageId,
          loggedIn: userInfoStore.state.loggedIn,
          error: err.message
        }
      })

      // Fallback to handle errors
      fetchImage({ getNextImage: true })

      setTimeout(() => {
        ratingPending = false
        rateImageRequest()
      }, 300)
    }
  }, [
    componentState.apiKey,
    componentState.rateImage,
    componentState.rateQuality,
    fetchImage,
    imageArray,
    loadNextImage,
    setComponentState
  ])

  // Handle race condition where when a new image is populated
  // the old image is not removed properly.
  useEffect(() => {
    const updateImageArray = [...imageArray]

    if (
      imageArray.length > 1 &&
      imageArray[0] &&
      imageArray[0].id === lastRatedId
    ) {
      updateImageArray.shift()
      setImageArray(updateImageArray)

      // Fetch additional image?
      // fetchImage({ getNextImage: true })
    }
  }, [fetchImage, imageArray])

  useEffect(() => {
    let totalRated = AppSettings.get('imagesRated') || 0
    let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0

    setComponentState({
      imagesRated: totalRated,
      kudosEarned
    })
  }, [setComponentState])

  useEffectOnce(() => {
    errorCount = 0

    imagePending = false
    ratingPending = false
    ratingTime = Date.now()
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

  // Need to set API key on initial load
  useEffect(() => {
    setComponentState({ apiKey: AppSettings.get('apiKey') || ANON_API_KEY })
  }, [setComponentState])

  useEffect(() => {
    if (imagePending) {
      return
    }

    if (componentState.apiKey && !imagePending && componentState.initialLoad) {
      setTimeout(async () => {
        await fetchImage()
        await sleep(500)
        // await fetchImage({ getNextImage: true })
      }, 250)
    }
  }, [componentState.apiKey, componentState.initialLoad, fetchImage])

  if (DRAMA_MODE) {
    return (
      <div>
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
      </div>
    )
  }

  if (sharedKey) {
    return (
      <div>
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
          Rating images is not possible using a shared API key.
        </SubTitle>
      </div>
    )
  }

  return (
    <div className="pb-[88px]">
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
              href="https://aihorde.net/register"
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

      {componentState.errorMessage && (
        <div className="text-red-500 font-bold flex flex-row gap-2 mb-3">
          ERROR: {componentState.errorMessage}.
        </div>
      )}

      {componentState.initialLoad && (
        <>
          <SubTitle>Loading new image...</SubTitle>
          <div className="mt-2">
            <SubTitle>
              <SpinnerV2 />
            </SubTitle>
          </div>
        </>
      )}

      {!componentState.initialLoad && imageArray[0] && imageArray[0].id && (
        <div>
          <div className="flex flex-col align-center items-center w-full overflow-x-hidden">
            <ImageContainer>
              <Image
                id={imageArray[0].id}
                pending={componentState.imagePending}
                src={imageArray[0].url}
                alt="Rate this image"
              />
              {imageArray[1] && imageArray[1].id && (
                <Image
                  id={imageArray[1].id}
                  pending={componentState.imagePending}
                  src={imageArray[1].url}
                  alt="Rate this image"
                  // Pre-cache image... maybe?
                  style={{ display: 'none' }}
                />
              )}
              {componentState.imagePending && (
                <ImageOverlay>
                  <SpinnerV2 />
                </ImageOverlay>
              )}
            </ImageContainer>
            <div className="mt-3 flex flex-col align-center items-center w-full">
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
      )}

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
    </div>
  )
}

export default Rate
