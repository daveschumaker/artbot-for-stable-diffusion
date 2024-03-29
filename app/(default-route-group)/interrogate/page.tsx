import { baseHost, basePath } from 'BASE_PATH'
import InterrogatePage from 'app/_pages/InterrogatePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interrogate (img2text) - ArtBot for Stable Diffusion',
  openGraph: {
    description:
      'Discover AI generated descriptions, suggested tags, or even predicted NSFW status for a given image.',
    title: 'ArtBot - Interrogate images (img2text)',
    images: [`${baseHost}${basePath}/robot_exam.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_exam.png`
  }
}

export default function Page() {
  return <InterrogatePage />
}
