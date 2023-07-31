import { baseHost, basePath } from 'BASE_PATH'
import ProfilePage from 'app/_pages/ProfilePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Details - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - User Profile',
    images: [`${baseHost}${basePath}/robot_profile.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_profile.png`
  }
}

export default function Page() {
  return <ProfilePage />
}
