import CreatePage from 'app/_pages/CreatePage'

async function getPageData() {
  let availableModels: Array<any> = []
  let modelDetails: any = {}

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/models-available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/model-details`
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
  const { modelDetails } = await getPageData()

  // Forward fetched data to your Client Component
  return <CreatePage modelDetails={modelDetails} />
}
