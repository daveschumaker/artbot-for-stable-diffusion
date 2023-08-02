import FaqPage from 'app/_pages/FaqPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - FAQ'
  }
}

export default function Page() {
  return <FaqPage />
}
