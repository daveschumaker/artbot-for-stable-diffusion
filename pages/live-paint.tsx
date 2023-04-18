/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import LivePaint from 'components/pages/LivePaint'
import Head from 'next/head'

const LivePaintPage = () => {
  return (
    <>
      <Head>
        <title>Live Paint - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Live Paint" />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robots_drawing.png"
        />
      </Head>
      <LivePaint />
    </>
  )
}

export default LivePaintPage
