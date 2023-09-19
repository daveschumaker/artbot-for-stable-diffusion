import dynamic from 'next/dynamic'

const DynamicPainterCanvas = dynamic(() => import('./painterCanvas'), {
  ssr: false
})

export default function PainterCanvas(props: any) {
  return <DynamicPainterCanvas {...props} />
}
