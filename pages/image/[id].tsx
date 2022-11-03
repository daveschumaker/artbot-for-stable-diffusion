// @ts-nocheck
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import LazyLoad from 'react-lazyload'
import Masonry from 'react-responsive-masonry'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import ImageDetails from '../../components/ImageDetails'
import PageTitle from '../../components/UI/PageTitle'

import Spinner from '../../components/Spinner'
import { useWindowSize } from '../../hooks/useWindowSize'
import { fetchRelatedImages, getImageDetails } from '../../utils/db'
import {
  downloadImage,
  uploadImg2Img,
  uploadInpaint
} from '../../controllers/imageDetailsCommon'
import { trackEvent, trackGaEvent } from '../../api/telemetry'

const StyledImage = styled.img`
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
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
  const size = useWindowSize()
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [imageDetails, setImageDetails] = useState({})
  const [pendingDownload, setPendingDownload] = useState(false)
  const [relatedImages, setRelatedImages] = useState([])

  const fetchImageDetails = async (jobId: string) => {
    const data = await getImageDetails(jobId)
    setIsInitialLoad(false)
    setImageDetails(data)

    if (data?.base64String) {
      findRelatedImages(data.parentJobId)
    }
  }

  const handleDeleteImageClick = async () => {
    router.push(`/images`)
  }

  const findRelatedImages = async (parentJobId = '') => {
    if (parentJobId) {
      const foundImages = await fetchRelatedImages(parentJobId)
      setRelatedImages(foundImages)
    }
  }

  const handleDownloadClick = async () => {
    if (pendingDownload) {
      return
    }

    setPendingDownload(true)

    const imageDownload = await downloadImage(imageDetails)
    const { success } = imageDownload

    if (success) {
      trackEvent({
        event: 'DOWNLOAD_PNG',
        context: 'ImagePage'
      })
      trackGaEvent({
        action: 'btn_download_png',
        params: {
          context: 'ImagePage'
        }
      })
    }
    setPendingDownload(false)
  }

  useEffect(() => {
    if (id) {
      fetchImageDetails(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const noImageFound = !isInitialLoad && !imageDetails?.base64String

  let imageColumns = 2
  // @ts-ignore
  if (size?.width > 1280) {
    imageColumns = 4
    // @ts-ignore
  } else if (size?.width > 800) {
    imageColumns = 3
  }

  return (
    <div>
      <Head>
        <title>ArtBot - Image details</title>
      </Head>
      <div className="inline-block w-1/2">
        {!isInitialLoad && noImageFound ? (
          <PageTitle>Image not found</PageTitle>
        ) : (
          <PageTitle>Image details</PageTitle>
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
            <StyledImage
              src={'data:image/webp;base64,' + imageDetails.base64String}
              className="mx-auto rounded"
              alt={imageDetails.prompt}
            />
            <ImageDetails
              imageDetails={imageDetails}
              onDelete={handleDeleteImageClick}
            />
          </div>
          <div className="mb-4">
            <PageTitle>Advanced Options</PageTitle>
            <Section>
              <OptionsLink
                onClick={() => {
                  console.log(`what are we sending?`, imageDetails)
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
                    const clone = true
                    uploadInpaint(imageDetails, clone)
                    router.push(`/?panel=inpainting&edit=true`)
                  }}
                >
                  [ clone and edit inpainting mask ]
                </OptionsLink>
              </Section>
            )}
            <Section>
              <OptionsLink onClick={() => handleDownloadClick()}>
                [ download PNG {pendingDownload && '(processing...)'} ]
              </OptionsLink>
            </Section>
          </div>
        </>
      )}

      {!isInitialLoad && relatedImages.length > 1 && (
        <div className="pt-2 border-0 border-t-2 border-dashed border-slate-500">
          <PageTitle>Related images</PageTitle>
          <div className="mt-4 flex gap-y-2.5 flex-wrap gap-x-2.5">
            <Masonry columnsCount={imageColumns} gutter="8px">
              {relatedImages.map(
                (image: {
                  jobId: string
                  base64String: string
                  prompt: string
                  timestamp: number
                  seed: number
                }) => {
                  return (
                    <LazyLoad key={image.jobId} once>
                      <Link href={`/image/${image.jobId}`} passHref>
                        <img
                          src={'data:image/webp;base64,' + image.base64String}
                          style={{
                            borderRadius: '4px',
                            width: '100%',
                            display: 'block'
                          }}
                          alt={image.prompt}
                        />
                      </Link>
                    </LazyLoad>
                  )
                }
              )}
            </Masonry>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImagePage
