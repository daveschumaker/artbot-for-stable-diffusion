import dynamic from 'next/dynamic'

const DynamicModal = dynamic(() => import('./modal'), {
  // suspense: true
})

export default function Modal(props: any) {
  return <DynamicModal {...props} />
}
