import dynamic from 'next/dynamic'

const DynamicSlider = dynamic(() => import('./slider'), {
  ssr: false
})

export default function Slider(props: any) {
  return <DynamicSlider {...props} />
}
