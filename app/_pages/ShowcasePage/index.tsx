'use client'

/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import styles from './showcase.module.css'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { basePath } from 'BASE_PATH'
import { debounce } from 'app/_utils/debounce'
import MasonryLayout from 'app/_modules/MasonryLayout'

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

  const handleScroll = debounce(() => {
    const isAtBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 10

    if (isAtBottom && !loading) {
      fetchImages()
    }
  }, 450)

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
      <MasonryLayout gap={8}>
        {imageList.map((image) => {
          return (
            <div key={image.shortlink}>
              <div key={image.shortlink} className={styles.ImageCard}>
                <Link href={`/?i=${image.shortlink}`}>
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
    </>
  )
}
