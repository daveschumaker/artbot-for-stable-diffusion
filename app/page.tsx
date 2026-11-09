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
          method: 'GET',
          // Shortlinks never change, and Next 15 stopped caching fetches by default.
          cache: 'force-cache'
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { i } = await searchParams

  try {
    if (i) {
      const resp = await fetch(
        `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/shortlink/load/${i}`,
        {
          method: 'GET',
          // Shortlinks never change, and Next 15 stopped caching fetches by default.
          cache: 'force-cache'
        }
      )

      const data = (await resp.json()) || {}
      const { data: shortlinkData = {} } = data || {}
      const shortlinkImageParams = shortlinkData.imageParams || {}

      let imageTitleType = 'Shared image'

      if (shortlinkImageParams.params.tiling) {
        imageTitleType = `Shared image tile`
      }

      const title = `ArtBot - ${imageTitleType} created with ${shortlinkImageParams.models[0]}`
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

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const { i: id } = resolvedSearchParams

  if (id) {
    const { shortlinkImageParams } = await getPageData(resolvedSearchParams)

    if (shortlinkImageParams) {
      return (
        <SharedImageView imageDetails={shortlinkImageParams} imageId={id} />
      )
    }
  }

  return <HomePage />
}
