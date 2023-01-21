/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon'
import SpinnerV2 from '../components/Spinner'
import StarRating from '../components/StarRating/starRating'
import Linker from '../components/UI/Linker'
import PageTitle from '../components/UI/PageTitle'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import AppSettings from '../models/AppSettings'
import { clientHeader } from '../utils/appUtils'

const MAX_ERROR_COUNT = 30

interface IQualityMap {
  [key: number]: number
}

// Stable Horde API does something silly where you rate image quality from best (1) to worst (5).
// Meanwhile, you rate images aesthetically from worst (1) to best (10). Lining these up is confusing
// and counter-intuitive.
const QUALITY_MAP: IQualityMap = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
  5: 0
}

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

const Rate = () => {
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
    rateImage: 0,
    rateQuality: 0,

    imageOneStatus: 'show',
    imageTwoStatus: 'stage',
    imageOneUrl: '',
    imageTwoUrl: ''
  })

  const fetchImage = useCallback(async () => {
    let data: any = {}
    try {
      if (imagePending) {
        return
      }

      if (errorCount >= MAX_ERROR_COUNT) {
        setComponentState({
          initialLoad: false,
          imagePending: false,
          showError: true
        })

        imagePending = false
        return
      }

      imagePending = true
      const res = await fetch('https://ratings.droom.cloud/api/v1/rating/new', {
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader(),
          apikey: componentState.apiKey
        }
      })
      data = (await res.json()) || {}
    } catch (err) {
      errorCount++
      setTimeout(() => {
        imagePending = false
        fetchImage()
      }, 300)
      return
    } finally {
      if (data.id) {
        imagePending = false
        errorCount = 0

        setComponentState({
          rateImage: 0,
          rateQuality: 0,
          datasetId: data.dataset_id,
          imageId: data.id,
          imageUrl: data.url,
          initialLoad: false,
          imagePending: false,
          showError: false
        })

        if (activeImage === 1) {
          activeImage = 2
          setComponentState({
            imageTwoUrl: data.url
          })
        } else {
          activeImage = 1
          setComponentState({
            imageOneUrl: data.url
          })
        }
      }
    }
  }, [componentState.apiKey, setComponentState])

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

    if (componentState.rateImage === 0 && componentState.rateQuality === 0) {
      return
    }

    ratingPending = true

    setComponentState({
      imagePending: true,
      ratingPending: true
    })

    const ratingData = {
      artifacts: QUALITY_MAP[componentState.rateQuality],
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
      fetchImage()

      const { reward } = data

      if (reward) {
        let totalRated = AppSettings.get('imagesRated') || 0
        let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0
        totalRated++
        kudosEarned += reward

        AppSettings.save('imagesRated', totalRated)
        AppSettings.save('kudosEarnedByRating', kudosEarned)

        errorCount = 0
        setComponentState({
          imagesRated: totalRated,
          kudosEarned,
          showError: false
        })
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

  useEffect(() => {
    if (imagePending) {
      return
    }

    if (componentState.apiKey && !imagePending) {
      setTimeout(() => {
        fetchImage()
      }, 500)
    }
  }, [componentState.apiKey, fetchImage])

  useEffectOnce(() => {
    errorCount = 0

    imagePending = false
    ratingPending = false
  })

  useEffect(() => {
    if (componentState.rateImage === 0 || componentState.rateQuality === 0) {
      return
    }

    rateImageRequest()
  }, [componentState.rateImage, componentState.rateQuality, rateImageRequest])

  useEffect(() => {
    setComponentState({ apiKey: AppSettings.get('apiKey') })
  }, [setComponentState])

  return (
    <>
      <Head>
        <title>ArtBot - Rate images</title>
      </Head>
      <PageTitle>Rate images</PageTitle>
      {!componentState.apiKey && (
        <>
          <SubTitle>
            Log in with your API key on the{' '}
            <Linker href="/settings">settings page</Linker> in order to begin
            rating images and receive kudo awards.
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
      {componentState.apiKey && componentState.initialLoad && (
        <>
          <SubTitle>Loading new image...</SubTitle>
          <SubTitle>
            <SpinnerV2 />
          </SubTitle>
        </>
      )}

      {componentState.apiKey &&
      !componentState.initialLoad &&
      componentState.imageUrl ? (
        <div>
          <div className="flex flex-col align-center items-center w-full overflow-x-hidden">
            <ImageContainer>
              <Image
                status={componentState.imageOneStatus}
                pending={componentState.imagePending}
                src={componentState.imageOneUrl}
                alt="Rate this image"
                onLoad={() => {
                  ratingPending = false
                  setComponentState({
                    imageOneStatus: 'show',
                    imageTwoStatus: 'hide',
                    ratingPending: false
                  })

                  setTimeout(() => {
                    setComponentState({
                      imageTwoStatus: 'stage'
                    })
                  }, 250)
                }}
              />
              <Image
                status={componentState.imageTwoStatus}
                pending={componentState.imagePending}
                src={componentState.imageTwoUrl}
                alt="Rate this image"
                onLoad={() => {
                  ratingPending = false
                  setComponentState({
                    imageOneStatus: 'hide',
                    imageTwoStatus: 'show',
                    ratingPending: false
                  })

                  setTimeout(() => {
                    setComponentState({
                      imageOneStatus: 'stage'
                    })
                  }, 250)
                }}
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
                  count={5}
                  disabled={componentState.ratingPending}
                  onStarClick={rateQuality}
                />
                <span className="text-xs">best</span>
              </div>
            </div>
          </div>
          <div className="mb-2 mt-2 flex flex-row gap-2 text-sm">
            <div>Images rated: {componentState.imagesRated}</div>
            <div>Kudos earned: {componentState.kudosEarned}</div>
          </div>
        </div>
      ) : null}
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
    </>
  )
}

export default Rate
