/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import LastResort from 'modules/LastResort'
import Head from 'next/head'

const DebugExport = () => {
  return (
    <>
      <Head>
        <title>Debug Export - ArtBot for KoboldAI</title>
        <meta name="twitter:title" content="ArtBot -Debug" />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robots_talking.jpg"
        />
      </Head>
      <LastResort />
    </>
  )
}

export default DebugExport
