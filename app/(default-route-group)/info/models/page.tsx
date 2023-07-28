import { basePath } from 'BASE_PATH'
import ModelDetailsPage from 'app/_pages/InfoPage/models/details'
import { Metadata } from 'next'

export const revalidate = 2

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

    console.log(`modelDetailsData`, modelDetailsData)
  } catch (err) {}

  return {
    availableModels,
    modelDetails
  }
}

export const metadata: Metadata = {
  title: 'Model Details - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Model Details',
    images: [`${basePath}/robot_clipboard.png`]
  },
  twitter: {
    images: `${basePath}/robot_clipboard.png`
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
