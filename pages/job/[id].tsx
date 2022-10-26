import PageTitle from '../../components/PageTitle'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { fetchRelatedImages } from '../../utils/db'
import Spinner from '../../components/Spinner'
import LazyLoad from 'react-lazyload'
import Link from 'next/link'
import ImageSquare from '../../components/ImageSquare'
import { CreateImageJob } from '../../types'
import Head from 'next/head'

const JobPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [images, setImages] = useState([])

  const fetchJobDetails = async (jobId: string) => {
    let foundImages = await fetchRelatedImages(jobId)
    foundImages = foundImages.length > 0 ? foundImages.reverse() : []
    setImages(foundImages)
    setIsInitialLoad(false)
  }

  useEffect(() => {
    if (id) {
      // @ts-ignore
      fetchJobDetails(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const sortImages = () => {
    // @ts-ignore
    const divs = []

    let currentTimestamp: number

    // @ts-ignore
    let groupImages: Array<React.ReactNode> = []
    images.forEach((image: CreateImageJob, i) => {
      if (!image) {
        return
      }

      //@ts-ignore
      if (image.jobTimestamp !== currentTimestamp) {
        if (groupImages.length > 0) {
          divs.push(
            <div
              key={`settings-${image.jobId}`}
              className="flex flex-col md:flex-row border-b-2 border-dashed border-slate-500 mb-4"
            >
              <div className="flex w-full md:w-[200px] font-mono text-xs mb-2">
                <ul>
                  {image.img2img && <li>Source: img2img</li>}
                  {image.negative && <li>Negative prompt: {image.negative}</li>}
                  <li>Sampler: {image.sampler}</li>
                  <li>Steps: {image.steps}</li>
                  <li>cfg scale: {image.cfg_scale}</li>
                  {image.img2img && image.denoising_strength && (
                    <li>Denoise: {image.denoising_strength}</li>
                  )}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 w-full pb-2 mb-2">
                {groupImages}
              </div>
            </div>
          )
          groupImages = []
        }

        // @ts-ignore
        currentTimestamp = image.jobTimestamp
        // @ts-ignore
        const niceDate = new Date(image.jobTimestamp).toLocaleString()
        divs.push(
          <div
            className="text-teal-500 mb-2 text-sm font-bold"
            key={`timestamp-${image.jobTimestamp}-${i}`}
          >
            {niceDate}
          </div>
        )
      }

      groupImages.push(
        <div key={image.jobId}>
          <LazyLoad once>
            <Link href={`/image/${image.jobId}`} passHref>
              <ImageSquare
                //@ts-ignore
                imageDetails={image}
                imageType={'image/webp'}
              />
            </Link>
          </LazyLoad>
        </div>
      )
    })

    if (groupImages.length > 0) {
      const image: CreateImageJob = images.slice(-1)[0]
      divs.push(
        <div
          className="flex flex-row border-b-2 border-dashed border-slate-500 mb-4"
          key={`lastKeyHere`}
        >
          <div className="flex w-[200px] font-mono text-xs">
            <ul>
              {image.img2img && <li>Source: img2img</li>}
              {image.negative && <li>Negative prompt: {image.negative}</li>}
              <li>Sampler: {image.sampler}</li>
              <li>Steps: {image.steps}</li>
              <li>cfg scale: {image.cfg_scale}</li>
              {image.denoising_strength && (
                <li>Denoise: {image.denoising_strength}</li>
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 w-full pb-2 mb-2">
            {groupImages}
          </div>
        </div>
      )
      groupImages = []
    }

    return divs
  }

  return (
    <div className="w-full">
      <Head>
        <title>ArtBot - Job details</title>
      </Head>
      <PageTitle>Job details</PageTitle>
      {isInitialLoad && <Spinner />}
      {images.length > 0 && sortImages()}
    </div>
  )
}

export default JobPage
