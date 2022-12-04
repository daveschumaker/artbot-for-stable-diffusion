import dynamic from 'next/dynamic'

const DynamicSettingsPage = dynamic(() => import('./settingsPage'), {
  ssr: false
})

export default function SettingsPage(props: any) {
  return <DynamicSettingsPage {...props} />
}
