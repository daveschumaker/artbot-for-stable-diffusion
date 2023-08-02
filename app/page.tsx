import { baseHost, basePath } from 'BASE_PATH'
import SharedImageView from './_modules/SharedImageView'
import HomePage from './_pages/HomePage'

async function getPageData(searchParams: any) {
  let shortlinkImageParams: any = null

  const { i } = searchParams

  try {
    if (i) {
      const resp = await fetch(
        `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/load/${i}`,
        {
          method: 'GET'
        }
      )
      const data = (await resp.json()) || {}
      const { data: shortlinkData = {} } = data || {}
      shortlinkImageParams = shortlinkData.imageParams || null
    }
  } catch (err) {
    console.log(`getPageData error?`, err)
  }

  return {
    shortlinkImageParams
  }
}

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

// THIS IS BROKEN IN NEXT.JS v13.4.10+
// CAUSES PRODUCTION BUILDS TO BLOW UP.
// DO NOT UPGRADE UNTIL FIXED
export async function generateMetadata({ searchParams }: Props) {
  const { i } = searchParams

  try {
    if (i) {
      const resp = await fetch(
        `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/load/${i}`,
        {
          method: 'GET'
        }
      )

      const data = (await resp.json()) || {}
      const { data: shortlinkData = {} } = data || {}
      const shortlinkImageParams = shortlinkData.imageParams || null

      const title = `ArtBot - Shareable link created with ${shortlinkImageParams.models[0]}`
      return {
        title: `🤖 ${title}`,
        description: shortlinkImageParams.prompt,
        openGraph: {
          type: 'website',
          url: `${baseHost}${basePath}`,
          title: `🤖 ${title}`,
          description: shortlinkImageParams.prompt,
          siteName: 'ArtBot for Stable Diffusion',
          images: [
            {
              url: `https://s3.amazonaws.com/tinybots.artbot/artbot/images/${i}.webp`
            }
          ]
        },
        twitter: {
          title: `🤖 ${title}`,
          card: 'summary_large_image',
          creator: '@davely',
          images: `https://s3.amazonaws.com/tinybots.artbot/artbot/images/${i}.webp`
        }
      }
    }
  } catch (err) {
    console.log(`Error?`, err)
    return {}
  }
}

export default async function Page({ searchParams }: { searchParams: any }) {
  const { i: id } = searchParams

  if (id) {
    const { shortlinkImageParams } = await getPageData(searchParams)

    if (shortlinkImageParams) {
      return (
        <SharedImageView imageDetails={shortlinkImageParams} imageId={id} />
      )
    }
  }

  return <HomePage />
}
