import { IconAlertTriangle } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import MaxWidth from 'app/_components/MaxWidth'
import Select from 'app/_components/Select'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { Button } from 'app/_components/Button'
import { useState } from 'react'
import { Value } from '_types'
import { sleep } from 'app/_utils/sleep'

async function downloadDbAsJson(chunkSize: number) {
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
    let blob = new Blob([jsonData], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `artbot_data_batch_${index}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    // Attempt to handle OOM condition
    blob = null as unknown as Blob
  }

  let endIndex = Math.min(rowsPerBatch, arr.length)

  async function processArrayInBatches(index = 1, startIndex = 0) {
    if (startIndex >= arr.length) return

    let batch = arr.slice(startIndex, endIndex)
    let jsonData = convertBatchToJson(batch)
    downloadBatch(jsonData, index)

    startIndex = endIndex
    endIndex = Math.min(startIndex + rowsPerBatch, arr.length)
    index++

    await sleep(1000)

    // Attempt to handle OOM condition
    batch = null
    jsonData = null as unknown as string

    processArrayInBatches(index, startIndex)
  }

  processArrayInBatches()
}

export default function LastResortExport() {
  const [filesPer, setFilesPer] = useState({
    value: 100,
    label: '100 images / zip'
  })

  return (
    <div style={{ marginTop: '8px' }}>
      <SubSectionTitle>
        Export Method
        <div className="text-xs" style={{ fontWeight: 400, maxWidth: '480px' }}>
          Automatically download a series of raw JSON files directly from the
          browser&apos;s database. This is useful in instances where the browser
          (usually Firefox) is having trouble initializing the Dexie library.
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            maxWidth: '480px',
            paddingTop: '8px'
          }}
        >
          (!) Adjust number of rows per zip file if you encounter memory errors
          or the browser crashing.
        </div>
      </SubSectionTitle>
      <FlexRow gap={8}>
        <Button onClick={() => downloadDbAsJson(filesPer.value)}>
          <IconAlertTriangle /> Download JSON
        </Button>
        <MaxWidth style={{ margin: 0, maxWidth: '200px' }}>
          <Select
            options={[
              { value: 25, label: '25 images / zip' },
              { value: 50, label: '50 images / zip' },
              { value: 100, label: '100 images / zip' },
              { value: 250, label: '250 images / zip' },
              { value: 500, label: '500 images / zip' },
              { value: 750, label: '750 images / zip' }
            ]}
            onChange={(option: any) => {
              setFilesPer(option)
            }}
            inputMode="none"
            value={filesPer as unknown as Value}
          />
        </MaxWidth>
      </FlexRow>
    </div>
  )
}
