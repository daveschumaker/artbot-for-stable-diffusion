import { baseHost, basePath } from 'BASE_PATH'
import ShowcasePage from 'app/_pages/ShowcasePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Showcase - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Showcase',
    images: [`${baseHost}${basePath}/robot_profile.png`]
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_profile.png`
  }
}

async function getPageData() {
  try {
    const resp = await fetch(
      `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/images/public/list/0`,
      {
        method: 'GET'
      }
    )
    const imageList = (await resp.json()) || []
    return imageList
  } catch (err) {
    console.log(`getPageData error?`, err)
    return []
  }
}

export default async function Page() {
  const imageList = await getPageData()
  return <ShowcasePage images={imageList} />
}
