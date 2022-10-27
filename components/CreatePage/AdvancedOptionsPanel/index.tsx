import dynamic from 'next/dynamic'

const DynamicOptionsPanel = dynamic(() => import('./advancedOptionsPanel'), {})

export default function Modal(props: any) {
  return <DynamicOptionsPanel {...props} />
}
