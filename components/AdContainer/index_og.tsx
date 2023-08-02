import dynamic from 'next/dynamic'

const DynamicAdContainer = dynamic(() => import('./adContainer'), {
  ssr: false
})

export default function AdContainer(props: any) {
  return <DynamicAdContainer {...props} />
}
