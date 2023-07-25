import ControlNet from 'app/_pages/ControlNetPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ControlNet - ArtBot for Stable Diffusion',
  openGraph: {
    type: 'website',
    url: 'https://tinybots.net/artbot',
    title: 'ArtBot - ControlNet',
    description:
      'Use a source image and text prompt to better control diffusion models, and create amazing images with generative AI powered by Stable Diffusion.',
    images: [
      {
        url: '/artbot/robot_control.jpg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: '/artbot/robot_control.jpg'
  }
}

export default function Page() {
  return <ControlNet />
}
