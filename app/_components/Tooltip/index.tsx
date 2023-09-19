import dynamic from 'next/dynamic'

const DynamicTooltip = dynamic(() => import('./tooltip'), {
  ssr: false
})

export default function Tooltip(props: any) {
  return <DynamicTooltip {...props} />
}
