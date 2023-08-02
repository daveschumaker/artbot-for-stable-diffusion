import ChangelogPage from 'app/_pages/ChangelogPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upscale - ArtBot for Stable Diffusion',
  description:
    'ArtBot - Image upscaling and post processing via the Stable Horde',
  openGraph: {
    title: 'ArtBot - Upscale'
  }
}

export default function Page() {
  return <ChangelogPage />
}
