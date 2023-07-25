import SubSectionTitle from 'app/_components/SubSectionTitle'
import { UploadButton } from 'components/UploadButton'
import { addCompletedJobToDexie, getImageDetails } from 'utils/db'

// @ts-ignore
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      // @ts-ignore
      const content = event.target.result
      resolve(content)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

// @ts-ignore
async function parseJSONFromFile(file) {
  try {
    const fileContent = await readFileAsText(file)
    // @ts-ignore
    const jsonData = JSON.parse(fileContent)
    return jsonData
  } catch (error) {
    console.error('Error parsing JSON from file:', error)
    return null
  }
}

export default function LastResortImport() {
  const handleFileSelect = async (file: any) => {
    try {
      const jsonData = await parseJSONFromFile(file)
      if (jsonData) {
        for (const idx of jsonData) {
          if (!idx || !idx.jobId || !idx.hordeImageId) continue

          const imageExists = await getImageDetails(idx.jobId)

          if (!imageExists) {
            console.log(`we rolling!`, idx)
            await addCompletedJobToDexie(idx)
          }
        }
      }
    } catch (error) {
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
      <UploadButton
        accept="application/JSON"
        // @ts-ignore
        handleFile={handleFileSelect}
        label="Choose file"
      />
    </div>
  )
}
