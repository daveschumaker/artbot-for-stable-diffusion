import { ReactNode } from 'react'
import { Metadata } from 'next'

import AppInit from './_modules/AppInit'
import SlidingMenu from './_modules/SlidingMenu'
import PollController from 'app/_modules/PollController'
import { baseHost, basePath } from 'BASE_PATH'
import AppAnalytics from './_modules/AppAnalytics'
import ToastContainer from './_modules/ToastContainer'

import 'tailwindcss/tailwind.css'
import 'app/_styles/globals.css'
import FooterV2 from './_components/FooterV2'
import { HeaderNav } from './_componentsV2/HeaderNav'
import ModalProvider from './_modules/ModalProvider'

export const metadata: Metadata = {
  metadataBase: new URL(baseHost),
  title: 'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde',
  description:
    'Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by the AI Horde. No login required and free to use.',
  icons: `${basePath}/favicon.ico`,
  manifest: `${basePath}/manifest.json`,
  openGraph: {
    type: 'website',
    url: `${baseHost}${basePath}`,
    title:
      'ArtBot - Create images with Stable Diffusion, utilizing the AI Horde',
    description:
      'Generate AI-created images and photos with Stable Diffusion using a distributed computing cluster powered by the AI Horde. No login required and free to use.',
    siteName: 'ArtBot for Stable Diffusion',
    images: [
      {
        url: `${baseHost}${basePath}/painting_bot.png`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: `${baseHost}${basePath}/painting_bot.png`
  }
}

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else if (localStorage.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        // This ensures that footer is always forced to bottom of page if there is extra room.
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <ModalProvider>
          <div style={{ flex: 1, minHeight: '100vh' }}>
            <AppInit />
            <AppAnalytics />
            <PollController />
            <HeaderNav />
            <ToastContainer />
            <SlidingMenu />
            {children}
          </div>
          <FooterV2 />
        </ModalProvider>
      </body>
    </html>
  )
}
