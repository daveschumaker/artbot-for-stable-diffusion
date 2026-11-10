import FlexRow from 'app/_components/FlexRow'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import SpinnerV2 from 'app/_components/Spinner'
import { useState } from 'react'
import { addCompletedJobToDexie, getImageDetails } from 'app/_utils/db'
import { UploadButton } from 'app/_modules/UploadButton'

function readFileAsText(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      // event.target is this reader; readAsText() always produces a string result
      const content = reader.result as string
      resolve(content)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

async function parseJSONFromFile(file: Blob) {
  try {
    const fileContent = await readFileAsText(file)
    const jsonData = JSON.parse(fileContent)
    return jsonData
  } catch (error) {
    console.error('Error parsing JSON from file:', error)
    return null
  }
}

export default function LastResortImport() {
  const [loading, setLoading] = useState(false)

  const handleFileSelect = async (file: File) => {
    setLoading(true)
    try {
      const jsonData = await parseJSONFromFile(file)
      if (jsonData) {
        for (const idx of jsonData) {
          if (!idx || !idx.jobId || !idx.hordeImageId) continue

          const imageExists = await getImageDetails(idx.jobId)

          if (!imageExists) {
            await addCompletedJobToDexie(idx)
          }
        }
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error parsing JSON:', error)
    }
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <SubSectionTitle>
        Import Method
        <div className="text-xs font-[400]" style={{ maxWidth: '480px' }}>
          Select a raw JSON database file to import.
        </div>
      </SubSectionTitle>
      <FlexRow>
        <UploadButton
          accept="application/JSON"
          handleFile={handleFileSelect}
          label="Choose file"
        />
        {loading && <SpinnerV2 />}
      </FlexRow>
    </div>
  )
}
