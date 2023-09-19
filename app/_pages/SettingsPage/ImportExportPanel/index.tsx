import dynamic from 'next/dynamic'

const DynamicImportExportPanel = dynamic(() => import('./importExportPanel'), {
  ssr: false
})

export default function ImportExportPanel(props: any) {
  return <DynamicImportExportPanel {...props} />
}
