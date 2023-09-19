import dynamic from 'next/dynamic'

const DynamicFloatingActionButton = dynamic(
  () => import('./floatingActionButton'),
  {
    ssr: false
  }
)

export default function Overlay(props: any) {
  return <DynamicFloatingActionButton {...props} />
}
