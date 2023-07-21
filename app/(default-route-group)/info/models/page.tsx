import ModelDetailsPage from 'app/_pages/InfoPage/models/details'

export const revalidate = 2

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

    console.log(`modelDetailsData`, modelDetailsData)
  } catch (err) {}

  return {
    availableModels,
    modelDetails
  }
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const { availableModels, modelDetails } = await getPageData()

  return (
    <ModelDetailsPage
      availableModels={availableModels}
      modelDetails={modelDetails}
    />
  )
}
