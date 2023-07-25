import ImagesPage from 'app/_pages/ImagesPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your images - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Your images'
  }
}

export default function Page() {
  return <ImagesPage />
}
