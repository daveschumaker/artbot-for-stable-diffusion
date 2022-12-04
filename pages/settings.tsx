import Head from 'next/head'
import { trackEvent } from '../api/telemetry'
import SettingsPageComponent from '../components/SettingsPage'
import { useEffectOnce } from '../hooks/useEffectOnce'

const SettingsPage = () => {
  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/pending'
    })
  })

  return (
    <>
      <Head>
        <title>ArtBot - Srttings</title>
      </Head>
      <SettingsPageComponent />
    </>
  )
}

export default SettingsPage
