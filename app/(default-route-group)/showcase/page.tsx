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

export default async function Page() {
  return <ShowcasePage />
}
