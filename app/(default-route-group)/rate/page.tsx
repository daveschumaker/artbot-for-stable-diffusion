import RatePage from 'app/_pages/RatePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rate Images - ArtBot for Stable Diffusion',
  openGraph: {
    description:
      'Give aesthetics ratings for images created with Stable Diffusion and help improve future models.',
    title: 'ArtBot - Rate Images',
    images: ['/artbot/robot_judge.png']
  },
  twitter: {
    images: '/artbot/robot_judge.png'
  }
}

export default function Page() {
  return <RatePage />
}
