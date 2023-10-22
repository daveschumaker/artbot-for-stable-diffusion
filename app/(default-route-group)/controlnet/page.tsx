import { baseHost, basePath } from 'BASE_PATH'
import { InputProvider } from 'app/_modules/InputProvider/context'
import ControlNet from 'app/_pages/ControlNetPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ControlNet - ArtBot for Stable Diffusion',
  openGraph: {
    type: 'website',
    url: `${baseHost}${basePath}`,
    title: 'ArtBot - ControlNet',
    description:
      'Use a source image and text prompt to better control diffusion models, and create amazing images with generative AI powered by Stable Diffusion.',
    images: [
      {
        url: `${baseHost}${basePath}/robot_control.jpg`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: `${baseHost}${basePath}/robot_control.jpg`
  }
}

export default function Page() {
  return (
    <InputProvider>
      <ControlNet />
    </InputProvider>
  )
}
