import UpscalePage from 'components/pages/UpscalePage'
import Head from 'next/head'

const Interrogate = () => {
  return (
    <>
      <Head>
        <title>Upscale image - ArtBot for Stable Diffusion</title>
        <meta
          name="twitter:title"
          content="ArtBot - Image upscaling and post processing via the Stable Horde"
        />
        <meta
          name="twitter:description"
          content="Discover AI generated descriptions, suggested tags, or even predicted NSFW status for a given image."
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robot_exam.png"
        />
      </Head>
      <UpscalePage />
    </>
  )
}

export default Interrogate
