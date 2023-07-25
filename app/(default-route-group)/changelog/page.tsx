import ChangelogPage from 'app/_pages/ChangelogPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Changelog'
  }
}

export default function Page() {
  return <ChangelogPage />
}
