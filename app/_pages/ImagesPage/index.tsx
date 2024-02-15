'use client'

import PageTitle from 'app/_components/PageTitle'
import Head from 'next/head'
import useGetImages from './hooks/useGetImages'
import useGetColumns from './hooks/useGetColumns'
import MasonryLayout from 'app/_modules/MasonryLayout'
import NiceModal from '@ebay/nice-modal-react'
import ImageModalV3 from 'app/_modules/ImageModalV3'

export default function ImagePage() {
  const [images] = useGetImages()
  const [columns] = useGetColumns()

  return (
    <div>
      <Head>
        <title>Your images - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Your images" />
      </Head>
      <PageTitle>Your images</PageTitle>
      <div>
        <MasonryLayout columns={columns} gap={8}>
          {images.length > 0 &&
            images.map((image) => {
              console.log(`img--`, image)
              if (!image.blob) {
                return (
                  <div key={`id_${image.hordeId}`}>
                    <img src="" />
                  </div>
                )
              }

              return (
                <div
                  key={`id_${image.hordeId}`}
                  onClick={() => {
                    NiceModal.show('image-modal', {
                      content: <ImageModalV3 jobId={image.jobId} />,
                      maxWidth: 'max-w-[2000px]'
                    })
                  }}
                >
                  <img src={URL.createObjectURL(image.blob)} />
                </div>
              )
            })}
        </MasonryLayout>
      </div>
    </div>
  )
}
