import { basePath } from 'BASE_PATH'
import SettingsPage from 'app/_pages/SettingsPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings and Preferences - ArtBot for Stable Diffusion',
  openGraph: {
    description: 'Manage your preferences for ArtBot and the Stable Horde',
    title: 'ArtBot - Settings',
    images: [`${basePath}/robot_gears.png`]
  },
  twitter: {
    images: `${basePath}/robot_gears.png`
  }
}

export default function Page() {
  return <SettingsPage />
}
