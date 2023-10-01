import { baseHost, basePath } from 'BASE_PATH'
import ShowcasePage from 'app/_pages/ShowcasePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Showcase - ArtBot for Stable Diffusion',
  openGraph: {
    title: 'ArtBot - Community Showcase',
    images: [`${baseHost}${basePath}/robot_showcase.jpg`],
    description:
      'Get inspiration and discover what other ArtBot fans have created and publicly shared with the ArtBot Showcase.'
  },
  twitter: {
    images: `${baseHost}${basePath}/robot_showcase.jpg`
  }
}

async function getPageData() {
  try {
    const resp = await fetch(
      `${process.env.NEXT_SHORTLINK_SERVICE}/api/v1/images/public/list/0`,
      {
        method: 'GET',
        next: { revalidate: 60 }
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
