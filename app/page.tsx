import SharedImageView from './_modules/SharedImageView'
import CreatePage from './_pages/CreatePage'

async function getPageData(searchParams: any) {
  let availableModels: Array<any> = []
  let modelDetails: any = {}
  let shortlinkImageParams: any = ''

  const { i } = searchParams

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

    if (i) {
      const res = await fetch(
        `http://localhost:${process.env.PORT}/artbot/api/get-shortlink?shortlink=${i}`
      )

      const data = (await res.json()) || {}
      console.log(i, data)
      const { imageParams } = data.imageParams || {}
      shortlinkImageParams = imageParams || null
    }
  } catch (err) {}

  return {
    availableModels,
    modelDetails,
    shortlinkImageParams
  }
}

export default async function Page({ searchParams }: { searchParams: any }) {
  const { i: id } = searchParams

  // Fetch data directly in a Server Component
  const { modelDetails, shortlinkImageParams } = await getPageData(searchParams)

  if (shortlinkImageParams) {
    return <SharedImageView imageDetails={shortlinkImageParams} imageId={id} />
  }

  // Forward fetched data to your Client Component
  return <CreatePage modelDetails={modelDetails} />
}
