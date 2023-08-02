import dynamic from 'next/dynamic'

const DynamicImg2ImgPanel = dynamic(() => import('./img2imgPanel'), {})

export default function Img2ImgPanel(props: any) {
  return <DynamicImg2ImgPanel {...props} />
}
