import dynamic from 'next/dynamic'

const DynamicImg2ImgModal = dynamic(() => import('./img2imgModal'), {
  ssr: false
})

export default function Img2ImgModal(props: any) {
  return <DynamicImg2ImgModal {...props} />
}
