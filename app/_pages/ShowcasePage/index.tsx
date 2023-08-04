'use client'

/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import styles from './showcase.module.css'
import MasonryLayout from 'components/MasonryLayout'
import Link from 'next/link'
import LazyLoad from 'react-lazyload'

export default function ShowcasePage({ images = [] }: { images: any[] }) {
  return (
    <>
      <PageTitle>ArtBot Community Showcase</PageTitle>
      <div
        style={{
          marginTop: '-4px',
          paddingBottom: '12px'
        }}
      >
        Images created with and shared by ArtBot users
      </div>
      <div className={styles.ImageList}>
        <MasonryLayout gap={8}>
          {images.map((image) => {
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
