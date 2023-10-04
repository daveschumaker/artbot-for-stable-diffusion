// Only used in development environment contents
import { basePath } from 'BASE_PATH'
import { Button } from 'app/_components/Button'
import Panel from 'app/_components/Panel'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { db } from 'app/_db/dexie'
import { addCompletedJobToDexie } from 'app/_utils/db'

export default function DevExportImport() {
  const importRecord = async (id = 0) => {
    try {
      const res = await fetch(`${basePath}/api/debug/import-images?id=${id}`)
      const data = await res.json()
      const { current, next } = data

      if (current && current.jsonString) {
        const imageDetails = JSON.parse(current.jsonString)
        await addCompletedJobToDexie(imageDetails)
      }

      if (next) {
        await importRecord(next)
      }
    } catch (err) {
      console.log(`Something happened`, err)
    }
  }

  const startIteration = async () => {
    let nextKey
    do {
      nextKey = await iterateNext(nextKey)
    } while (nextKey)
  }

  const iterateNext = async (key: number) => {
    let nextKey

    // Fetch the next record based on the given key.
    const record =
      key !== undefined
        ? await db.completed.get({ id: key })
        : await db.completed.limit(1).first()

    if (record) {
      console.log('Processing record:', key, record)

      await fetch(`${basePath}/api/debug/export-images`, {
        method: 'POST',
        body: JSON.stringify(record)
      })

      // Now, determine the next key for recursion.
      const nextRecord = await db.completed
        .where('id')
        .above(record.id)
        .limit(1)
        .first()
      if (nextRecord) {
        nextKey = nextRecord.id
      }
    }

    return nextKey
  }

  return (
    <Panel>
      <SubSectionTitle>_DEV_ Dexie Export / Import</SubSectionTitle>
      <div style={{ fontSize: '14px', padding: '8px 0' }}>
        This component is used to directly export and import IndexedDb to an
        NeDB file for development and database migration testing.{' '}
        <strong>
          If you see this in production, something unfortunate happened.
        </strong>
      </div>
      <Button onClick={startIteration}>
        EXPORT ME! (This will OVERWRITE db data)
      </Button>
      <Button onClick={importRecord}>
        IMPORT ME! (This will OVERWRITE dexie data)
      </Button>
    </Panel>
  )
}
