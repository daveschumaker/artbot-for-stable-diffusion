import { basePath } from 'BASE_PATH'
import CreatePage from 'app/_pages/CreatePage'

async function getPageData() {
  let availableModels: Array<any> = []
  let modelDetails: any = {}

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}${basePath}/api/models-available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}${basePath}/api/model-details`
    )
    const modelDetailsData = (await modelDetailsRes.json()) || {}
    modelDetails = modelDetailsData.models
  } catch (err) {}

  return {
    availableModels,
    modelDetails
  }
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const { availableModels, modelDetails } = await getPageData()

  // Forward fetched data to your Client Component
  return (
    <CreatePage availableModels={availableModels} modelDetails={modelDetails} />
  )
}
