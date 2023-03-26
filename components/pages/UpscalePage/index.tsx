import dynamic from 'next/dynamic'

const DynamicUpscalePage = dynamic(() => import('./upscalePage'), {
  ssr: false
})

export default function UpscalePage(props: any) {
  return <DynamicUpscalePage {...props} />
}
