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
  display: inline-block;
  position: relative;
  max-width: 100%;
  max-height: 480px;

  @media (min-width: 640px) {
    max-height: 512px;
    max-width: 512px;
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
  background-color: rgb(0, 0, 0, 0.6);
`

const Image = styled.img`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
  max-width: 100%;
  max-height: 480px;

  @media (min-width: 640px) {
    max-height: 512px;
    max-width: 512px;
  }
`

let errorCount = 0
let pending = false
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
    pending: false,
    rating: null
  })

  const fetchImage = useCallback(async () => {
    let data: any = {}
    try {
      if (pending) {
        return
      }

      if (errorCount >= MAX_ERROR_COUNT) {
        setComponentState({
          initialLoad: false,
          pending: false,
          showError: true
        })

        pending = false
        return
      }

      pending = true
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
        pending = false
        fetchImage()
      }, 300)
      return
    } finally {
      if (data.id) {
        pending = false
        errorCount = 0

        setComponentState({
          activeStar: 0,
          datasetId: data.dataset_id,
          imageId: data.id,
          imageUrl: data.url,
          initialLoad: false,
          pending: false,
          rating: null,
          showError: false
        })
      }
    }
  }, [componentState.apiKey, setComponentState])

  const rateImage = useCallback(
    async (rating: number) => {
      if (pending) {
        return
      }

      pending = true

      setComponentState({
        pending: true
      })

      const ratingData = {
        rating,
        datasetId: componentState.datasetId
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
        const { reward } = data

        if (reward) {
          let totalRated = AppSettings.get('imagesRated') || 0
          let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0
          totalRated++
          kudosEarned += reward

          AppSettings.save('imagesRated', totalRated)
          AppSettings.save('kudosEarnedByRating', kudosEarned)

          errorCount = 0
          pending = false
          setComponentState({
            imagesRated: totalRated,
            kudosEarned,
            showError: false
          })

          setTimeout(() => {
            fetchImage()
          }, 100)
        }
      } catch (err) {
        errorCount++
        setTimeout(() => {
          pending = false
          rateImage(rating)
        }, 300)
      }
    },
    [
      componentState.apiKey,
      componentState.datasetId,
      componentState.imageId,
      fetchImage,
      setComponentState
    ]
  )

  useEffect(() => {
    let totalRated = AppSettings.get('imagesRated') || 0
    let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0

    setComponentState({
      imagesRated: totalRated,
      kudosEarned
    })
  }, [setComponentState])

  useEffect(() => {
    if (pending) {
      return
    }

    if (componentState.apiKey && !pending) {
      setTimeout(() => {
        fetchImage()
      }, 500)
    }
  }, [componentState.apiKey, fetchImage])

  useEffectOnce(() => {
    errorCount = 0
    pending = false
  })

  useEffect(() => {
    setComponentState({ apiKey: AppSettings.get('apiKey') })
  }, [setComponentState])

  return (
    <>
      <Head>
        <title>ArtBot - Rate images</title>
      </Head>
      <PageTitle>Rate images</PageTitle>
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
          <div className="mb-2">
            <strong>Rate this image:</strong>
            <div>
              Rating criteria: How much do <em>you</em> like this image?
            </div>
            <div>1 (worst) - 10 (best)</div>
          </div>
          <ImageContainer>
            <Image src={componentState.imageUrl} alt="Rate this image" />
            {componentState.pending && (
              <ImageOverlay>
                <SpinnerV2 />
              </ImageOverlay>
            )}
          </ImageContainer>
          <StarRating
            disabled={componentState.pending}
            onStarClick={rateImage}
          />
          <div className="mt-2 text-sm">
            <div>Images rated: {componentState.imagesRated}</div>
            <div>Kudos earned: {componentState.kudosEarned}</div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Rate
