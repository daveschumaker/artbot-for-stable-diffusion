import PendingPage from 'app/_pages/PendingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pending images - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Pending images'
  }
}

export default function Page() {
  return (
    <div>
      <PendingPage />
    </div>
  )
}
