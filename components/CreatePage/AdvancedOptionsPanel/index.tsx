import dynamic from 'next/dynamic'

const DynamicOptionsPanel = dynamic(() => import('./advancedOptionsPanel'))

export default function AdvancedOptionsPanel(props: any) {
  return <DynamicOptionsPanel {...props} />
}
