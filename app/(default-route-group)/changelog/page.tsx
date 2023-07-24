import ChangelogPage from 'app/_pages/ChangelogPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'Changelog - ArtBot for Stable Diffusion',
    images: [
      {
        url: 'https://tinybots.net/artbot/painting_bot.png'
      }
    ]
  }
}

export default function Page() {
  return <ChangelogPage />
}
