import SpinnerV2 from 'app/_components/Spinner'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { useState } from 'react'
import { dbImport } from 'app/_utils/db'
import styles from './component.module.css'
import { showErrorToast, showSuccessToast } from 'app/_utils/notificationUtils'

export default function ImportDatabase() {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <Section className={styles.ImportDatabase}>
      <SubSectionTitle>
        <strong>Import browser database</strong>
        <div className="block w-full mt-2 mb-2 text-xs font-[400]">
          Import a previously exported ArtBot database.
        </div>
        <div className="block w-full mt-2 mb-2 text-xs font-[700] text-red-500">
          IMPORTANT! THIS WILL **COMPLETELY** OVERWRITE ANY CURRENT ARTBOT
          DATABASE PRESENT WITHIN THIS BROWSER CONTEXT.
        </div>
        {done && (
          <div className="flex flex-row w-full mb-2 text-xs items-center gap-2">
            ArtBot database imported! 😎
          </div>
        )}
        {loading && (
          <div className="flex flex-row w-full mb-2 text-xs items-center gap-2">
            <SpinnerV2 size={18} />
            Importing database...
          </div>
        )}
      </SubSectionTitle>
      <label htmlFor="file-upload" className={styles.ImportButton}>
        Import database
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".json"
        onChange={async (event) => {
          if (!event) return
          if (!event.target || !event.target.files?.length) return

          setLoading(true)
          setDone(false)
          const file = event.target.files[0]
          const blob = new Blob([file], { type: file.type })
          try {
            await dbImport(blob)
            showSuccessToast({ message: 'ArtBot database imported!' })
            setDone(true)
          } catch {
            showErrorToast({
              message:
                'Unable to import this database. Your existing data has been kept.'
            })
          } finally {
            setLoading(false)
            event.target.value = ''
          }
        }}
      />
    </Section>
  )
}
