import dynamic from 'next/dynamic'

const DynamicMenu = dynamic(() => import('./menu'), {
  ssr: false
})

export default function Menu(props: any) {
  return <DynamicMenu {...props} />
}
