import Head from 'next/head'
import PageTitle from 'app/_components/PageTitle'
import { baseHost, basePath } from 'BASE_PATH'

export default function DisabledRatePage() {
  return (
    <div>
      <Head>
        <title>Rate images - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="Rate images with ArtBot" />
        <meta
          name="twitter:description"
          content="Give aesthetics ratings for images created with Stable Diffusion and help improve future models."
        />
        <meta
          name="twitter:image"
          content={`${baseHost}${basePath}/robot_judge.png`}
        />
      </Head>
      <PageTitle>Rate images (disabled)</PageTitle>
      <div style={{ fontSize: '14px', paddingBottom: '8px' }}>
        Unfortunately, rating images is no longer available on ArtBot due to
        backend changes to the Horde API.
      </div>
    </div>
  )
}
