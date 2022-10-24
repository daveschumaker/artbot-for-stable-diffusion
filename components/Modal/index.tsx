import dynamic from 'next/dynamic'

const DynamicModal = dynamic(() => import('./modal'), {
  suspense: true
})

export default function Modal({ handleClose = () => {} }) {
  return <DynamicModal handleClose={handleClose} />
}
