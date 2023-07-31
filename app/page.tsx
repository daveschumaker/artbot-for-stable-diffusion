import { baseHost, basePath } from 'BASE_PATH'
import SharedImageView from './_modules/SharedImageView'
import HomePage from './_pages/HomePage'

async function getPageData(searchParams: any) {
  let shortlinkImageParams: any = ''

  const { i } = searchParams

  try {
    if (i) {
      const res = await fetch(
        `http://localhost:${process.env.PORT}${basePath}/api/get-shortlink?shortlink=${i}`
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

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props) {
  // parent?: ResolvingMetadata
  const { i } = searchParams

  try {
    if (i) {
      const res = await fetch(
        `http://localhost:${process.env.PORT}${basePath}/api/get-shortlink?shortlink=${i}`
      )

      const data = (await res.json()) || {}
      console.log(i, data)
      const { imageParams } = data.imageParams || {}
      const shortlinkImageParams = imageParams || null

      const title = `ArtBot - Shareable link created with ${shortlinkImageParams.models[0]}`
      return {
        metadataBase: new URL(baseHost),
        title,
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
  } catch (err) {}
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
