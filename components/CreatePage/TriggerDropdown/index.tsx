import dynamic from 'next/dynamic'

const DynamicTriggerDropdown = dynamic(() => import('./triggerDropdown'), {
  ssr: false
})

export default function TriggerDropdown(props: any) {
  return <DynamicTriggerDropdown {...props} />
}
