import { ReactNode } from 'react'
import HeaderNav from './_modules/HeaderNav'
import '../styles/globals.css'
import AppInit from './_modules/AppInit'
import SlidingMenu from './_modules/SlidingMenu'
import Footer from './_components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://1b46-23-93-98-252.ngrok-free.app'),
  title: 'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde',
  description:
    'Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by the AI Horde. No login required and free to use.',
  icons: '/artbot/favicon.ico',
  manifest: '/artbot/manifest.json',
  openGraph: {
    type: 'website',
    url: 'https://tinybots.net/artbot',
    title:
      'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde',
    description:
      'Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by the AI Horde. No login required and free to use.',
    siteName: 'ArtBot for Stable Diffusion',
    images: [
      {
        url: '/artbot/painting_bot.png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: '/artbot/painting_bot.png'
  }
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body
        // This ensures that footer is always forced to bottom of page if there is extra room.
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppInit />
        <HeaderNav />
        <SlidingMenu />
        {children}
        <Footer />
      </body>
    </html>
  )
}
