import dynamic from 'next/dynamic'

const DynamicEditor = dynamic(() => import('./editor'), {
  ssr: false
})

export default function Editor(props: any) {
  return <DynamicEditor {...props} />
}
