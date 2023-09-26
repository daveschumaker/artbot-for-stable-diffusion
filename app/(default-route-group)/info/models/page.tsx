import { baseHost, basePath } from 'BASE_PATH'
import ModelDetailsPage from 'app/_pages/InfoPage/models/details'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
// export const revalidate = 1

const fetchModelDetals = async () => {
  try {
    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}${basePath}/api/model-details`,
      {
        cache: 'no-store'
      }
    )
    const modelDetailsData = (await modelDetailsRes.json()) || {}
    return modelDetailsData
  } catch (err) {
    console.log(`Error: Unable to fetch model-details from /info/models`)
    return {}
  }
}

async function getPageData() {
  let availableModels: Array<any> = []
  let modelDetails: any = {}

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}${basePath}/api/models-available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    let modelDetailsData: any = await fetchModelDetals()
    modelDetails = modelDetailsData.models
  } catch (err) {
    console.log(`Unable to load model details page (/info/models) on SSR`)
    console.log(err)
  }

  return {
    availableModels,
    modelDetails
  }
}

export const metadata: Metadata = {
  title: 'Model Details - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Model Details',
    images: [`${baseHost}${basePath}/robot_clipboard.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_clipboard.png`
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
