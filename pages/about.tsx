/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useState } from 'react'
import styled from 'styled-components'
import { trackEvent } from '../api/telemetry'
import FeedbackModal from '../components/Feedback'
import Linker from '../components/UI/Linker'

import PageTitle from '../components/UI/PageTitle'
import Text from '../components/UI/Text'
import { useEffectOnce } from '../hooks/useEffectOnce'

const AboutWrapper = styled.div`
  margin-bottom: 80px;
`

const LinkButton = styled.div`
  cursor: pointer;
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

const HeroImage = styled.img`
  border-radius: 8px;
  box-shadow: 0 16px 38px -12px rgb(0 0 0 / 56%),
    0 4px 25px 0px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%);
  margin-bottom: 16px;
  width: 100%;
`

const HelpfulLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  margin-bottom: 4px;
  width: 100%;
`

const AboutPage = () => {
  const [showFeedback, setShowFeedback] = useState(false)

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/about'
    })
  })

  return (
    <AboutWrapper>
      {showFeedback && (
        <FeedbackModal handleClose={() => setShowFeedback(false)} />
      )}
      <Head>
        <title>ArtBot - About</title>
      </Head>
      <PageTitle>About ArtBot</PageTitle>
      <div className="mt-2">
        <HeroImage
          src="/artbot/painting_bot.png"
          alt="painting of a robot painting robots"
        />
        <HelpfulLinks className="mb-2">
          <Linker href="https://www.buymeacoffee.com/davely" target="_blank">
            Buy me a coffee
          </Linker>
          |
          <LinkButton onClick={() => setShowFeedback(true)}>
            Contact / Feedback
          </LinkButton>
          |<Linker href="/changelog">Changelog</Linker>|
          <Linker href="/faq">FAQ</Linker>
        </HelpfulLinks>
        <Text>
          ArtBot is an unofficial front-end web client designed for interacting
          with the{' '}
          <Linker
            href="https://stablehorde.net/"
            target="_blank"
            rel="noreferrer"
          >
            Stable Horde
          </Linker>{' '}
          distributed cluster.
        </Text>
        <Text>
          Stable Horde is an open source platform that utilizes idle GPU power
          provided by a community of generous users that allows anyone to create
          generative AI artwork on their own computers or mobile devices. More
          information is available on the{' '}
          <Linker
            href="https://stablehorde.net/"
            target="_blank"
            rel="noreferrer"
          >
            Stable Horde
          </Linker>{' '}
          page and you can also join their{' '}
          <Linker
            href="https://discord.gg/3DxrhksKzn"
            target="_blank"
            rel="noreferrer"
          >
            Discord server
          </Linker>{' '}
          for further discussion on the technology behind the cluster, as well
          as tools built on top of the platform (such as ArtBot).
        </Text>
        <Text>
          This particular web app was initially built as a side project by{' '}
          <Linker
            href="https://twitter.com/davely"
            target="_blank"
            rel="noopener noreferrer"
          >
            davely
          </Linker>{' '}
          as a way to experiment with various client-side technology, such as{' '}
          <Linker
            href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
            target="_blank"
            rel="noreferrer"
          >
            IndexedDB
          </Linker>{' '}
          and LocalStorage APIs. These APIs allow you to securely and privately
          store the AI generated images you&apos;ve created with the cluster
          within your own browser. The UI components are built using NextJS.
        </Text>
        <Text>
          The source code is available on{' '}
          <Linker
            href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </Linker>
          . Feedback and contributions are welcome! Feel free to reach out to me
          on Twitter at{' '}
          <Linker
            href="https://twitter.com/davely"
            target="_blank"
            rel="noopener noreferrer"
          >
            @davely
          </Linker>{' '}
          or on Discord at{' '}
          <Linker
            href="https://discordapp.com/users/bitbandit#4910"
            target="_blank"
            rel="noopener noreferrer"
          >
            bitbandit#4910
          </Linker>
          . If you have found this service useful, I&apos;d be grateful if you
          were to consider{' '}
          <Linker href="https://www.buymeacoffee.com/davely" target="_blank">
            buying me a coffee
          </Linker>{' '}
          (seriously, I love coffee). Regardless, I hope you are creating some
          awesome art! Cheers.
        </Text>
        <Text>-Dave Schumaker</Text>
      </div>
      <div className="mt-2">
        <h2 className="font-bold mb-2">Resources and tips</h2>
        <ul>
          <li>
            <Linker href="https://lexica.art/" target="_blank">
              Lexica - Prompt Search Engine
            </Linker>
          </li>
          <li>
            <Linker href="https://publicprompts.art/" target="_blank">
              Public Prompts Collection
            </Linker>
          </li>
          <li>
            <Linker
              href="https://www.reddit.com/r/StableDiffusion/comments/x4zs1r/comparison_between_different_samplers_in_stable/"
              target="_blank"
            >
              Sampler comparison (reddit)
            </Linker>
          </li>
          <li>
            <Linker href="https://github.com/Maks-s/sd-akashic" target="_blank">
              Stable Diffusion Artist Studies
            </Linker>
          </li>
          <li>
            <Linker
              href="https://promptomania.com/stable-diffusion-prompt-builder/"
              target="_blank"
            >
              Stable Diffusion Prompt Builder
            </Linker>
          </li>
        </ul>
      </div>
    </AboutWrapper>
  )
}

export default AboutPage
