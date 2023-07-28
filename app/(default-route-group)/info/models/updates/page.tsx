import { basePath } from 'BASE_PATH'
import ModelUpdatesPage from 'app/_pages/InfoPage/models/updates'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Model Updates - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Image Model Updates',
    images: [`${basePath}/robot_clipboard.png`]
  },
  twitter: {
    images: `${basePath}/robot_clipboard.png`
  }
}

export default function Page() {
  return <ModelUpdatesPage />
}
