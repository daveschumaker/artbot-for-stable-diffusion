import dynamic from 'next/dynamic'

const DynamicWorkerInfo = dynamic(() => import('./workerInfo'), {
  // suspense: true
})

export default function WorkerInfo(props: any) {
  return <DynamicWorkerInfo {...props} />
}
