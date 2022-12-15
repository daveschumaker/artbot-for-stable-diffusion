import dynamic from 'next/dynamic'

const DynamicOverlay = dynamic(() => import('./overlay'), {
  ssr: false
})

export default function Overlay(props: any) {
  return <DynamicOverlay {...props} />
}
