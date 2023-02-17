import dynamic from 'next/dynamic'

const DynamicImageDetails = dynamic(() => import('./imageDetails'), {
  ssr: true
})

export default function ImageDetails(props: any) {
  return <DynamicImageDetails {...props} />
}
