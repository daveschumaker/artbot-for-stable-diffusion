/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useCallback } from 'react'
import { useStore } from 'statery'
import styled from 'styled-components'
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon'
import StarIcon from '../components/icons/StarIcon'
import SpinnerV2 from '../components/Spinner'
import Linker from '../components/UI/Linker'
import PageTitle from '../components/UI/PageTitle'
import useComponentState from '../hooks/useComponentState'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { userInfoStore } from '../store/userStore'

const RatingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  column-gap: 8px;
  margin-top: 16px;
`

const StarButton = styled(StarIcon)`
  /* &:hover {
    fill: yellow;
  } */
`

const StarWrapper = styled.div`
  cursor: pointer;
`

const SubTitle = styled.div`
  font-size: 16px;
  padding-bottom: 8px;
`

const LinkDetails = styled.span`
  /* display: flex; */
  /* flex-direction: row; */
  /* column-gap: 4px; */
`

const ImageContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`

const Image = styled.img`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
  max-width: 512px;
`

const Rate = () => {
  const userStore = useStore(userInfoStore)
  const [componentState, setComponentState] = useComponentState({
    activeStar: 0,
    imageId: null,
    imageUrl: '',
    pending: false,
    rating: null
  })

  const fetchImage = useCallback(async () => {
    const res = await fetch('https://droom.cloud/api/rating/new')
    const data = await res.json()

    setComponentState({
      imageId: '',
      imageUrl: ''
    })

    console.log(`data?`, data)
  }, [setComponentState])

  const rateImage = useCallback(
    async (rating: number) => {
      setComponentState({
        pending: true
      })

      const ratingData = {
        rating,
        horde_id: userStore.username || ''
      }

      console.log(`It worked!`, ratingData)

      setTimeout(() => {
        setComponentState({
          activeStar: 0,
          pending: false,
          rating: null
        })
      }, 1000)

      return

      try {
        const resp = await fetch(
          `https://droom.cloud/api/rating/${componentState.imageId}`,
          {
            method: 'POST',
            body: JSON.stringify(ratingData),
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        const data = await resp.json()
        console.log(`data?`, data)
      } catch (err) {
      } finally {
        setComponentState({
          activeStar: 0,
          pending: false,
          rating: null
        })
      }
    },
    [componentState.imageId, setComponentState, userStore.username]
  )

  useEffectOnce(() => {
    // fetchImage()
    setComponentState({ imageUrl: 'https://placekitten.com/g/200/300' })
  })

  const renderStars = () => {
    const count = 5
    const elements = []

    for (let i = 0; i < count; i++) {
      const value = i + 1
      const filled =
        componentState.rating >= value || componentState.activeStar >= value
      elements.push(
        <StarWrapper
          onMouseEnter={() => setComponentState({ activeStar: value })}
          onMouseLeave={() => setComponentState({ activeStar: 0 })}
          onClick={() => {
            if (componentState.pending) {
              return
            }

            setComponentState({ rating: value })
            rateImage(value)
          }}
        >
          <StarButton size={32} fill={filled ? '#fcba03' : 'none'} />
        </StarWrapper>
      )
    }

    return elements
  }

  if (!userStore.username) {
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
            <LinkDetails>LAION</LinkDetails>
          </Linker>{' '}
          (the non-profit which helped trained Stable Diffusion) improve their
          library.
        </SubTitle>
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
    )
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
      {componentState.imageUrl ? (
        <div>
          <div className="mb-2">
            <strong>Rate this image:</strong>
          </div>
          <ImageContainer>
            <Image src={componentState.imageUrl} alt="Rate this image" />
          </ImageContainer>
          <RatingContainer>
            {renderStars()}
            {componentState.pending ? <SpinnerV2 size={32} /> : null}
          </RatingContainer>
        </div>
      ) : null}
    </>
  )
}

export default Rate
