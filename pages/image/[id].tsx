// @ts-nocheck
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import ImageDetails from '../../components/ImagePage/ImageDetails'
import PageTitle from '../../components/UI/PageTitle'

import Spinner from '../../components/Spinner'
import {
  fetchRelatedImages,
  getImageDetails,
  updateCompletedJob
} from '../../utils/db'
import {
  interrogateImage,
  uploadImg2Img,
  uploadInpaint,
  upscaleImage
} from '../../controllers/imageDetailsCommon'
import { trackEvent, trackGaEvent } from '../../api/telemetry'
import MenuButton from '../../components/UI/MenuButton'
// import CarouselIcon from '../../components/icons/CarouselIcon'
import HeartIcon from '../../components/icons/HeartIcon'
import { useSwipeable } from 'react-swipeable'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { kudosCost } from '../../utils/imageUtils'
import RelatedImages from '../../components/ImagePage/RelatedImages'
import { getRelatedImages } from './image.controller'

const StyledImage = styled.img`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
  max-height: 512px;
`

const Section = styled.div`
  padding-top: 8px;

  &:first-child {
    padding-top: 0;
  }
`

const OptionsLink = styled.div`
  display: inline-block;
  color: ${(props) => props.theme.navLinkActive};
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.navLinkNormal};
  }
`

const ImagePage = () => {
  const handlers = useSwipeable({
    onSwipedLeft: () => handleKeyPress(null, 'left'),
    onSwipedRight: () => handleKeyPress(null, 'right'),
    preventScrollOnSwipe: true,
    trackTouch: true,
    swipeDuration: 250,
    delta: 35
  })
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageDetails, setImageDetails] = useState({})
  const [pendingUpscale, setPendingUpscale] = useState(false)
  const [relatedImages, setRelatedImages] = useState([])
  const [optimisticFavorite, setOptimisticFavorite] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const currentIndex = relatedImages.findIndex((el) => {
    return el.jobId === id
  })

  const findRelatedImages = useCallback(async (parentJobId = '') => {
    const result = await getRelatedImages(parentJobId)
    setRelatedImages(result)
  }, [])

  const fetchImageDetails = useCallback(async () => {
    const data = (await getImageDetails(id)) || {}
    setIsInitialLoad(false)
    setOptimisticFavorite(data.favorited ? true : false)
    setImageDetails(data)

    if (data?.base64String) {
      findRelatedImages(data.parentJobId)
    }
  }, [findRelatedImages, id])

  const afterDeleteImageClick = async () => {
    router.push(`/images`)
  }

  const handleUpscaleClick = useCallback(async () => {
    if (pendingUpscale) {
      return
    }

    setPendingUpscale(true)

    trackEvent({
      event: 'UPSCALE_IMAGE_CLICK',
      context: '/pages/image/[id]'
    })

    const status = await upscaleImage(imageDetails)
    const { success } = status

    if (success) {
      trackEvent({
        event: 'UPSCALE_IMAGE_CLICK',
        context: '/pages/image/[id]'
      })
      trackGaEvent({
        action: 'btn_upscale',
        params: {
          context: '/pages/image/[id]'
        }
      })
      router.push('/pending')
    }
  }, [imageDetails, pendingUpscale, router])

  const handleFavoriteClick = useCallback(async () => {
    const newFavStatus = imageDetails.favorited ? false : true
    setOptimisticFavorite(newFavStatus)

    if (newFavStatus) {
      trackEvent({
        event: 'FAVORITE_IMG_CLICK',
        context: '/pages/image/[id]'
      })
    }

    await updateCompletedJob(
      imageDetails.id,
      Object.assign({}, imageDetails, {
        favorited: newFavStatus
      })
    )
    fetchImageDetails(id)
  }, [fetchImageDetails, id, imageDetails])

  useEffect(() => {
    if (id) {
      fetchImageDetails(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const maxLength = relatedImages.length

  const handleKeyPress = useCallback(
    (e: any, swipeDir) => {
      if (maxLength <= 1) {
        return
      }

      if (imageModalOpen) return

      if (e === null && swipeDir) {
        e = {}
        if (swipeDir === 'left') {
          e.key = 'ArrowLeft'
        } else if (swipeDir === 'right') {
          e.key = 'ArrowRight'
        }
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex !== 0 && relatedImages[currentIndex - 1]?.jobId) {
          router.replace(`/image/${relatedImages[currentIndex - 1].jobId}`)
        }
      } else if (e.key === 'ArrowRight') {
        if (
          currentIndex < maxLength - 1 &&
          relatedImages[currentIndex + 1]?.jobId
        ) {
          router.replace(`/image/${relatedImages[currentIndex + 1].jobId}`)
        }
      } else if (e.keyCode === 70) {
        handleFavoriteClick()
      }
    },
    [
      maxLength,
      imageModalOpen,
      currentIndex,
      router,
      relatedImages,
      handleFavoriteClick
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)

    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const noImageFound = !isInitialLoad && !imageDetails?.base64String

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/image/[id]'
    })
  })

  const upscaleCost = kudosCost({
    width: imageDetails.width,
    height: imageDetails.height,
    steps: imageDetails.steps,
    numImages: 1, // numImages
    postProcessors: imageDetails?.post_processing || [],
    sampler: imageDetails.sampler,
    control_type: imageDetails.source_image ? imageDetails.control_type : '',
    prompt: imageDetails.prompt,
    negativePrompt: imageDetails.negative
  })

  const imageUpscaled =
    imageDetails?.post_processing?.indexOf('RealESRGAN_x4plus') >= 0

  return (
    <div>
      <Head>
        <title>Image details - ArtBot for Stable Diffusion</title>
      </Head>
      <div className="flex flex-row w-full items-center">
        <div className="inline-block w-1/2">
          {!isInitialLoad && noImageFound ? (
            <PageTitle>Image not found</PageTitle>
          ) : (
            <PageTitle>
              Image details{' '}
              <div className="text-sm font-normal mt-[-4px]">
                {relatedImages.length > 1
                  ? `(${currentIndex + 1} / ${maxLength})`
                  : null}
              </div>
            </PageTitle>
          )}
        </div>
        {!isInitialLoad && (
          <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
            <MenuButton
              active={optimisticFavorite}
              title="Save as favorite"
              onClick={handleFavoriteClick}
            >
              <HeartIcon />
            </MenuButton>
            {/* <MenuButton>
              <CarouselIcon />
            </MenuButton> */}
          </div>
        )}
      </div>
      {isInitialLoad && <Spinner />}
      {!isInitialLoad && noImageFound && (
        <>
          <div>Oops!</div>
          <div className="mt-4">
            There is no image at this URL. Perhaps you&apos;ve bookmarked
            something that&apos;s been deleted. Or someone shared this link with
            you. All images are privately stored inside each user&apos;s
            browser.
          </div>
          <div className="mt-4 mb-2">
            <Link href="/" className="text-cyan-400">
              Why not create something new?
            </Link>
          </div>
        </>
      )}
      {!isInitialLoad && imageDetails?.base64String && (
        <>
          <div key={imageDetails.jobId} className="text-center pb-6">
            <div {...handlers}>
              <StyledImage
                src={'data:image/webp;base64,' + imageDetails.base64String}
                className="mx-auto rounded"
                alt={imageDetails.prompt}
              />
            </div>
            <ImageDetails
              imageDetails={imageDetails}
              onDelete={afterDeleteImageClick}
            />
          </div>
          <div className="mb-4">
            <PageTitle>Advanced Options</PageTitle>
            <Section>
              <OptionsLink
                onClick={() => {
                  trackEvent({
                    event: 'USE_IMG_FOR_INTERROGATE',
                    context: '/pages/image/[id]'
                  })
                  interrogateImage(imageDetails)
                  router.push(`/interrogate?user-share=true`)
                }}
              >
                [ interrogate image (image2text) ]
              </OptionsLink>
            </Section>
            <Section>
              {imageUpscaled ? (
                <div>[ upscaled image (already upscaled)]</div>
              ) : (
                <OptionsLink onClick={() => handleUpscaleClick()}>
                  [ upscale image ({upscaleCost} kudos){' '}
                  {pendingUpscale && '(processing...)'} ]
                </OptionsLink>
              )}
            </Section>
            <Section>
              <OptionsLink
                onClick={() => {
                  trackEvent({
                    event: 'USE_IMG_FOR_IMG2IMG',
                    context: '/pages/image/[id]'
                  })
                  uploadImg2Img(imageDetails)
                  router.push(`/?panel=img2img&edit=true`)
                }}
              >
                [ use for img2img ]
              </OptionsLink>
            </Section>
            <Section>
              <OptionsLink
                onClick={() => {
                  trackEvent({
                    event: 'USE_IMG_FOR_INPAINT',
                    context: '/pages/image/[id]'
                  })
                  uploadInpaint(imageDetails)
                  router.push(`/?panel=inpainting&edit=true`)
                }}
              >
                [ use for inpainting ]
              </OptionsLink>
            </Section>
            {imageDetails.canvasStore && (
              <Section>
                <OptionsLink
                  onClick={() => {
                    trackEvent({
                      event: 'CLONE_INPAINT_MASK',
                      context: '/pages/image/[id]'
                    })
                    const clone = true
                    uploadInpaint(imageDetails, { clone })
                    router.push(`/?panel=inpainting&edit=true`)
                  }}
                >
                  [ clone and edit inpainting mask ]
                </OptionsLink>
              </Section>
            )}
          </div>
        </>
      )}

      {!isInitialLoad && relatedImages.length > 1 && (
        <div className="pt-2 border-0 border-t-2 border-dashed border-slate-500">
          <RelatedImages
            onAfterDelete={() => findRelatedImages(imageDetails.parentJobId)}
            onModalOpen={setImageModalOpen}
            imageId={imageDetails.jobId}
            parentJobId={imageDetails.parentJobId}
            images={relatedImages}
            updateRelatedImages={() =>
              findRelatedImages(imageDetails.parentJobId)
            }
          />
        </div>
      )}
    </div>
  )
}

export default ImagePage
