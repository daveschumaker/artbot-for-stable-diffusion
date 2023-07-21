import SharedImageView from './_modules/SharedImageView'
import HomePage from './_pages/HomePage/index.page'

async function getPageData(searchParams: any) {
  let shortlinkImageParams: any = ''

  const { i } = searchParams

  try {
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
    shortlinkImageParams
  }
}

export default async function Page({ searchParams }: { searchParams: any }) {
  const { i: id } = searchParams

  // Fetch data directly in a Server Component
  const { shortlinkImageParams } = await getPageData(searchParams)

  if (shortlinkImageParams) {
    return <SharedImageView imageDetails={shortlinkImageParams} imageId={id} />
  }

  return <HomePage />
}
