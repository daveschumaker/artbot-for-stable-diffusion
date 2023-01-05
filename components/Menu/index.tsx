import dynamic from 'next/dynamic'

const DynamicMenu = dynamic(() => import('./menu'), {
  // suspense: true
})

export default function Menu(props: any) {
  return <DynamicMenu {...props} />
}
