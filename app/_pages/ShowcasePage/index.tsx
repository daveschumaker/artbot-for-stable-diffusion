'use client'

/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import styles from './showcase.module.css'
import MasonryLayout from 'components/MasonryLayout'
import Link from 'next/link'
import LazyLoad from 'react-lazyload'
import { useCallback, useEffect, useState } from 'react'
import { basePath } from 'BASE_PATH'

// Starts at 20 since SSR feeds in offset 0 info.
let offset = 20

export default function ShowcasePage({ images = [] }: { images: any[] }) {
  const [imageList, setImageList] = useState(images)
  const [loading, setLoading] = useState(false)
  const perPage = 20 // Number of images to load per API call

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      // Make your API call to fetch more images, passing the page number and perPage as parameters
      const response = await fetch(`${basePath}/api/showcase?offset=${offset}`)
      const data = await response.json()
      setImageList((prevImages) => [...prevImages, ...data])
      offset = offset + perPage
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleScroll = () => {
    const isAtBottom =
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight

    if (isAtBottom && !loading) {
      fetchImages()
    }
  }

  useEffect(() => {
    offset = 20
    // Attach the scroll event listener when the component mounts
    window.addEventListener('scroll', handleScroll)
    return () => {
      // Remove the scroll event listener when the component unmounts
      window.removeEventListener('scroll', handleScroll)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className={styles.ImageList}>
        <MasonryLayout gap={8}>
          {imageList.map((image) => {
            return (
              <LazyLoad key={image.shortlink} once>
                <div key={image.shortlink} className={styles.ImageCard}>
                  <Link href={`/?i=${image.shortlink}`}>
                    <img
                      className={styles.ShowcaseImage}
                      src={`https://s3.amazonaws.com/tinybots.artbot/artbot/images/${image.shortlink}.webp`}
                      alt={image.image_params.prompt}
                    />
                  </Link>
                </div>
              </LazyLoad>
            )
          })}
        </MasonryLayout>
      </div>
    </>
  )
}
