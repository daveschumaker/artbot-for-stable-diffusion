'use client'
import PageTitle from 'app/_components/PageTitle'
import ExportDatabase from '../ExportDatabase'
import ImportDatabase from '../ImportDatabase'
export default function LastResort() {
  return (
    <div>
      <PageTitle>Backup / Recovery</PageTitle>
      <ImportDatabase />
      <ExportDatabase />
    </div>
  )
}
