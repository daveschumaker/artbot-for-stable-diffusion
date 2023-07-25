import { IconAlertTriangle } from '@tabler/icons-react'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { Button } from 'components/UI/Button'
import { sleep } from 'utils/sleep'

async function downloadDbAsJson(chunkSize = 250) {
  // Fetch the array from the database (replace this with your database query)
  // @ts-ignore
  const arr = await window._artbotDb.completed.toArray()

  // If 'arr' is not an array or empty, handle the error
  if (!Array.isArray(arr) || arr.length === 0) {
    console.error('Input is not a non-empty array.')
    return
  }

  const rowsPerBatch = chunkSize // Number of rows per batch (adjust as needed)

  // Function to convert a batch of the array to JSON
  function convertBatchToJson(batch: Array<any>) {
    return JSON.stringify(batch)
  }

  // Function to download a batch of JSON data
  function downloadBatch(jsonData: any, index: number) {
    const blob = new Blob([jsonData], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `artbot_data_batch_${index}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  let endIndex = Math.min(rowsPerBatch, arr.length)
  console.log(`rowsPerBatch, arr.length`, rowsPerBatch, arr.length)

  async function processArrayInBatches(index = 1, startIndex = 0) {
    if (startIndex >= arr.length) return

    console.log(`what the batch?`, startIndex, endIndex)
    const batch = arr.slice(startIndex, endIndex)
    const jsonData = convertBatchToJson(batch)
    downloadBatch(jsonData, index)

    startIndex = endIndex
    endIndex = Math.min(startIndex + rowsPerBatch, arr.length)
    console.log(`new end?`, endIndex)
    index++

    await sleep(500)
    processArrayInBatches(index, startIndex)
  }

  processArrayInBatches()
}

export default function LastResortExport({ chunkSize }: { chunkSize: number }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <SubSectionTitle>
        Export Method
        <div className="text-xs font-[400]" style={{ maxWidth: '480px' }}>
          Automatically download a series of raw JSON files directly from the
          browser&apos;s database. This is useful in instances where the browser
          (usually Firefox) is having trouble initializing the Dexie library.
        </div>
      </SubSectionTitle>
      <Button onClick={() => downloadDbAsJson(chunkSize)}>
        <IconAlertTriangle /> Download JSON
      </Button>
    </div>
  )
}
