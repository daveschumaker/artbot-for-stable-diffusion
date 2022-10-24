/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Link from 'next/link'
import styled from 'styled-components'

import PageTitle from '../components/PageTitle'
import Text from '../components/Text'

const AboutWrapper = styled.div`
  margin-bottom: 80px;
`

const HeroImage = styled.img`
  border-radius: 8px;
  margin-bottom: 16px;
  width: 100%;
`

const AboutPage = () => {
  return (
    <AboutWrapper>
      <Head>
        <title>ArtBot - About</title>
      </Head>
      <PageTitle>About ArtBot</PageTitle>
      <div className="mt-2">
        <HeroImage
          src="/artbot/painting_bot.png"
          alt="painting of a robot painting robots"
        />
        <Text>
          ArtBot is an unofficial front-end web client designed for interacting
          with the{' '}
          <a
            href="https://stablehorde.net/"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            Stable Horde
          </a>{' '}
          distributed cluster.
        </Text>
        <Text>
          Stable Horde is an open source platform that utilizes idle GPU power
          provided by a community of generous users that allows anyone to create
          generative AI artwork on their own computers or mobile devices. More
          information is available on the{' '}
          <a
            href="https://stablehorde.net/"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            Stable Horde
          </a>{' '}
          page and you can also join their{' '}
          <a
            href="https://discord.gg/3DxrhksKzn"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            Discord server
          </a>{' '}
          for further discussion on the technology behind the cluster, as well
          as tools built on top of the platform (such as ArtBot).
        </Text>
        <Text>
          This particular web app was initially built as a side project by{' '}
          <Link href="https://twitter.com/davely">
            <a
              className="text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              davely
            </a>
          </Link>{' '}
          as a way to experiment with various client-side technology, such as{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            IndexedDB
          </a>{' '}
          and LocalStorage APIs. These APIs allow you to securely and privately
          store the AI generated images you&apos;ve created with the cluster
          within your own browser. The UI components are built using NextJS.
        </Text>
        <Text>
          The source code is available on{' '}
          <a
            href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400"
          >
            Github
          </a>{' '}
          and contributions are welcome!
        </Text>
      </div>
      <div className="mt-2">
        <h2 className="font-bold mb-2">Resources and tips</h2>
        <ul>
          <li>
            <Link href="https://lexica.art/">
              <a className="text-sm text-cyan-400" target="_blank">
                Lexica - Prompt Search Engine
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://publicprompts.art/">
              <a className="text-sm text-cyan-400" target="_blank">
                Public Prompts Collection
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://www.reddit.com/r/StableDiffusion/comments/x4zs1r/comparison_between_different_samplers_in_stable/">
              <a className="text-sm text-cyan-400" target="_blank">
                Sampler comparison (reddit)
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/Maks-s/sd-akashic">
              <a className="text-sm text-cyan-400" target="_blank">
                Stable Diffusion Artist Studies
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://promptomania.com/stable-diffusion-prompt-builder/">
              <a className="text-sm text-cyan-400" target="_blank">
                Stable Diffusion Prompt Builder
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </AboutWrapper>
  )
}

export default AboutPage
