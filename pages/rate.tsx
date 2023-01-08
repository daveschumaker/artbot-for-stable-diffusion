/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useCallback, useEffect } from 'react'
import { useStore } from 'statery'
import styled from 'styled-components'
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon'
import StarIcon from '../components/icons/StarIcon'
import SpinnerV2 from '../components/Spinner'
import Linker from '../components/UI/Linker'
import PageTitle from '../components/UI/PageTitle'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import AppSettings from '../models/AppSettings'
import { userInfoStore } from '../store/userStore'

const RatingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  column-gap: 8px;
  margin-top: 16px;
  height: 50px;
`

const StarButton = styled(StarIcon)`
  /* &:hover {
    fill: yellow;
  } */
`

const StarWrapper = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`

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

let pending = false
const Rate = () => {
  const userStore = useStore(userInfoStore)
  const [componentState, setComponentState] = useComponentState({
    activeStar: 0,
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
      const res = await fetch('https://droom.cloud/api/rating/new')
      const statusCode = res.status

      // NOTE: It appears nothing actually happens here.
      if (statusCode === 429) {
        setTimeout(() => {
          fetchImage()
        }, 500)
        return
      }

      data = (await res.json()) || {}
    } catch (err) {
      setTimeout(() => {
        fetchImage()
      }, 300)
      return
    } finally {
      if (data.id) {
        setComponentState({
          activeStar: 0,
          datasetId: data.dataset_id,
          imageId: data.id,
          imageUrl: data.url,
          initialLoad: false,
          pending: false,
          rating: null
        })

        pending = false
      }
    }
  }, [setComponentState])

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
        datasetId: componentState.datasetId,
        horde_id: userStore.username || ''
      }

      try {
        const res = await fetch(
          `https://droom.cloud/api/rating/${componentState.imageId}`,
          {
            method: 'POST',
            body: JSON.stringify(ratingData),
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        const data = await res.json()
        const { success } = data

        if (success) {
          let totalRated = AppSettings.get('imagesRated') || 0
          let kudosEarned = AppSettings.get('kudosEarnedByRating') || 0
          totalRated++
          kudosEarned += 5

          AppSettings.save('imagesRated', totalRated)
          AppSettings.save('kudosEarnedByRating', kudosEarned)

          setComponentState({
            imagesRated: totalRated,
            kudosEarned
          })
        }
      } catch (err) {
      } finally {
        setTimeout(() => {
          fetchImage()
        }, 250)
      }
    },
    [
      componentState.datasetId,
      componentState.imageId,
      fetchImage,
      setComponentState,
      userStore.username
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

    if (userStore.username && !pending) {
      setTimeout(() => {
        fetchImage()
      }, 500)
    }
  }, [fetchImage, userStore.username])

  useEffectOnce(() => {
    pending = false

    // console.log(`userStore`, userInfoStore.state)

    // setTimeout(() => {
    //   if (userStore.username && !pending) {
    //     fetchImage()
    //   }
    // }, 500)
  })

  const renderStars = () => {
    const count = 10
    const elements = []

    for (let i = 0; i < count; i++) {
      const value = i + 1
      const filled =
        componentState.rating >= value || componentState.activeStar >= value
      elements.push(
        <StarWrapper
          key={`star_${value}`}
          onMouseEnter={() => {
            if (pending) {
              return
            }

            setComponentState({ activeStar: value })
          }}
          onMouseLeave={() => setComponentState({ activeStar: 0 })}
          onClick={() => {
            if (pending) {
              return
            }

            setComponentState({ rating: value })
            rateImage(value)
          }}
        >
          <StarButton size={24} fill={filled ? '#fcba03' : 'none'} />
          {value}
        </StarWrapper>
      )
    }

    return elements
  }

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
      {!userStore.username && (
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
      {userStore.username && componentState.initialLoad && (
        <>
          <SubTitle>Loading new image...</SubTitle>
          <SubTitle>
            <SpinnerV2 />
          </SubTitle>
        </>
      )}

      {userStore.username &&
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
          <RatingContainer>{renderStars()}</RatingContainer>
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
