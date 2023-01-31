import Head from 'next/head'
import InterrogatePage from '../components/InterrogatePage'

const Interrogate = () => {
  return (
    <>
      <Head>
        <title>
          Interrogate Image (img2text) - ArtBot for Stable Diffusion
        </title>
        <meta
          name="twitter:title"
          content="ArtBot - Interrogate images (img2text)"
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
      <InterrogatePage />
    </>
  )
}

export default Interrogate
