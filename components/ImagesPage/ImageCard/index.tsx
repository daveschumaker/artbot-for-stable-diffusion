import dynamic from 'next/dynamic'

const DynamicImageCard = dynamic(() => import('./imageCard'), {
  suspense: true
})

export default function Modal(props: any) {
  return <DynamicImageCard {...props} />
}
