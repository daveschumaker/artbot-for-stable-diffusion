import dynamic from 'next/dynamic'

const DynamicOptionsPanel = dynamic(() => import('./optionsPanel'), {
  // ssr: false
})

export default function OptionsPanel(props: any) {
  return <DynamicOptionsPanel {...props} />
}
