import LivePaint from 'app/_pages/LivePaintPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Paint - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Live Paint',
    images: ['/artbot/robots_drawing.png']
  },
  twitter: {
    images: '/artbot/robots_drawing.png'
  }
}

export default function Page() {
  return <LivePaint />
}
