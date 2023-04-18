import dynamic from 'next/dynamic'

const DynamicLivePaintPage = dynamic(() => import('./livePaintPage'), {
  ssr: false
})

export default function LivePaint(props: any) {
  return <DynamicLivePaintPage {...props} />
}
