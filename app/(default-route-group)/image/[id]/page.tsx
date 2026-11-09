import ImagePage from 'app/_pages/ImagePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Details Page - ArtBot for Stable Diffusion'
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ImagePage id={id} />
}
