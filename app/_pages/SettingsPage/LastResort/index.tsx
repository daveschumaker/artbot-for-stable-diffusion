'use client'
import PageTitle from 'app/_components/PageTitle'
import ExportDatabase from '../ExportDatabase'
import ImportDatabase from '../ImportDatabase'
import { BackupOperations } from '../BackupOperations'
export default function LastResort() {
  return (
    <BackupOperations>
      <div>
        <PageTitle>Backup / Recovery</PageTitle>
        <ExportDatabase />
        <ImportDatabase />
      </div>
    </BackupOperations>
  )
}
