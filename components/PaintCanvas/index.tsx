import dynamic from 'next/dynamic'

const DynamicPaintCanvas = dynamic(() => import('./paintCanvas'), {
  ssr: false
})

export default function PaintCanvas(props: any) {
  return <DynamicPaintCanvas {...props} />
}
