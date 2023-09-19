import dynamic from 'next/dynamic'

const DynamicInteractiveModal = dynamic(() => import('./interactiveModal'), {
  ssr: false
})

export default function Overlay(props: any) {
  return <DynamicInteractiveModal {...props} />
}
