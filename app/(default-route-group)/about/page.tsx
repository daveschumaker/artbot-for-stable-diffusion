import AboutPage from 'app/_pages/AboutPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'About - ArtBot for Stable Diffusion'
  }
}

export default function Page() {
  return <AboutPage />
}
