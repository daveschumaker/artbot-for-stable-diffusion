import ModelUpdatesPage from 'app/_pages/InfoPage/models/updates'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Model Updates - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Image Model Updates',
    images: ['/artbot/robot_clipboard.png']
  },
  twitter: {
    images: '/artbot/robot_clipboard.png'
  }
}

export default function Page() {
  return <ModelUpdatesPage />
}
