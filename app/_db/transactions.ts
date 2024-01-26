import { db } from './dexie'

export const deleteJobIdFromCompleted = async (jobId: string) => {
  db.transaction('rw', db.completed, db.pending, db.image_files, async () => {
    await db.pending.where({ jobId }).delete()
    await db.completed.where({ jobId }).delete()
    // await db.favorites.where({ jobId }).delete()
    await db.image_files.where({ jobId }).delete()
  })
    .then(() => {
      console.log(
        'Transaction completed: Rows with jobId ' + jobId + ' deleted.'
      )
    })
    .catch((error) => {
      console.error('Transaction failed: ', error)
    })
}
