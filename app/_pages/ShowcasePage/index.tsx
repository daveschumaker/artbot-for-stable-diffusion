'use client'

/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import styles from './showcase.module.css'
import { useCallback, useEffect, useState } from 'react'
import { basePath } from 'BASE_PATH'
import MasonryLayout from 'app/_modules/MasonryLayout'
import { useModal } from '@ebay/nice-modal-react'
import ImageModal from './ImageModal'
import AwesomeModalWrapper from 'app/_modules/AwesomeModal'
import Link from 'next/link'
import { Button } from 'app/_components/Button'
import FlexRow from 'app/_components/FlexRow'
import SpinnerV2 from 'app/_components/Spinner'
import { updateAdEventTimestamp } from 'app/_store/appStore'

export default function ShowcasePage() {
  const imageModal = useModal(AwesomeModalWrapper)
  const [imageList, setImageList] = useState<any[]>([])
  const [canLoadMore, setCanLoadMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const perPage = 20 // Number of images to load per API call

  const handleImageClick = (imageDetails: any) => {
    imageModal.show({
      children: <ImageModal imageDetails={imageDetails} />,
      handleClose: () => imageModal.remove(),
      style: { maxWidth: '768px' }
    })
  }

  const initFetch = async () => {
    try {
      setLoading(true)

      // Make your API
      // call to fetch more images, passing the page number and perPage as parameters
      const response = await fetch(`${basePath}/api/showcase?offset=0`)
      const data = await response.json()
      setImageList((prevImages) => [...prevImages, ...data])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      const newOffset = offset + perPage

      // Make your API
      // call to fetch more images, passing the page number and perPage as parameters
      const response = await fetch(
        `${basePath}/api/showcase?offset=${newOffset}`
      )
      const data = await response.json()
      setImageList((prevImages) => [...prevImages, ...data])
      setOffset(newOffset)

      if (data.length < perPage) {
        setCanLoadMore(false)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    initFetch()
  }, [])

  return (
    <>
      <PageTitle>ArtBot Community Showcase</PageTitle>
      <div
        style={{
          marginTop: '-4px',
          paddingBottom: '12px'
        }}
      >
        Images created with and publicly shared by ArtBot users
      </div>
      <MasonryLayout gap={8}>
        {imageList.map((image) => {
          return (
            <div key={image.shortlink}>
              <div key={image.shortlink} className={styles.ImageCard}>
                <Link
                  href={`/?i=${image.shortlink}`}
                  onClick={(e) => {
                    updateAdEventTimestamp()
                    e.preventDefault()
                    e.stopPropagation()
                    handleImageClick(image)
                  }}
                >
                  <img
                    className={styles.ShowcaseImage}
                    src={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${image.shortlink}.webp`}
                    alt={image.image_params.prompt}
                  />
                </Link>
              </div>
            </div>
          )
        })}
      </MasonryLayout>
      {loading && (
        <FlexRow style={{ marginTop: '8px', justifyContent: 'center' }}>
          <SpinnerV2 />
        </FlexRow>
      )}
      {canLoadMore && (
        <FlexRow style={{ marginTop: '8px', justifyContent: 'center' }}>
          <Button onClick={fetchImages}>Load more</Button>
        </FlexRow>
      )}
    </>
  )
}
