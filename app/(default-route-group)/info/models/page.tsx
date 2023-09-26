import { baseHost, basePath } from 'BASE_PATH'
import ModelDetailsPage from 'app/_pages/InfoPage/models/details'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Model Details - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Model Details',
    images: [`${baseHost}${basePath}/robot_clipboard.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_clipboard.png`
  }
}

export default async function Page() {
  return <ModelDetailsPage />
}
