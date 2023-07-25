import ProfilePage from 'app/_pages/ProfilePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Details - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - User Profile',
    images: ['/artbot/robot_profile.png']
  },
  twitter: {
    images: '/artbot/robot_profile.png'
  }
}

export default function Page() {
  return <ProfilePage />
}
