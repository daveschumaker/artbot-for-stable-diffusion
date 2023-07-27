import ContactPage from 'app/_pages/ContactPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - ArtBot for Stable Diffusion',
  openGraph: {
    type: 'website',
    url: 'https://tinybots.net/artbot',
    title: 'ArtBot - Contact Form',
    images: [
      {
        url: '/artbot/robots_communicating.jpg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: '/artbot/robots_communicating.jpg'
  }
}

export default function Page() {
  return <ContactPage />
}
