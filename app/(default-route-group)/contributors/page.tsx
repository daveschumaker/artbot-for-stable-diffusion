import { baseHost, basePath } from 'BASE_PATH'
import ContributorsPage from 'app/_pages/ContributorsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contributors - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Awesome Contributors',
    images: [`${baseHost}${basePath}/robots_coding.jpg`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robots_coding.jpg`
  }
}

export default function Page() {
  return <ContributorsPage />
}
