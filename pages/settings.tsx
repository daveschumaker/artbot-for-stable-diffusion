import Head from 'next/head'
import { trackEvent } from '../api/telemetry'
import { fetchUserDetails } from '../api/userInfo'
import SettingsPageComponent from '../components/SettingsPage'
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
        <title>ArtBot - Settings</title>
      </Head>
      <SettingsPageComponent />
    </>
  )
}

export default SettingsPage
