import Head from 'next/head'
import { trackEvent } from '../api/telemetry'
import { fetchUserDetails } from '../api/userInfo'
import SettingsPageComponent from '../modules/SettingsPage'
import { useEffectOnce } from '../hooks/useEffectOnce'
import AppSettings from '../models/AppSettings'

const SettingsPage = () => {
  useEffectOnce(() => {
    if (AppSettings.get('apiKey')) {
      fetchUserDetails(AppSettings.get('apiKey'))
    }

    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/pending'
    })
  })

  return (
    <>
      <Head>
        <title>Settings and Preferences - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot Settings" />
        <meta
          name="twitter:description"
          content="Manage your preferences for ArtBot and the Stable Horde"
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robot_gears.png"
        />
      </Head>
      <SettingsPageComponent />
    </>
  )
}

export default SettingsPage
