import dynamic from 'next/dynamic'

const DynamicRelatedImages = dynamic(() => import('./relatedImages'), {
  ssr: false
})

export default function RelatedImages(props: any) {
  return <DynamicRelatedImages {...props} />
}
