/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { trackEvent } from '../api/telemetry'
import FeedbackForm from '../components/FeedbackForm'
import Modal from '../components/Modal'
import Linker from '../components/UI/Linker'

import PageTitle from 'app/_components/PageTitle'
import Text from '../components/UI/Text'
import { useEffectOnce } from '../hooks/useEffectOnce'
import styles from '../styles/about.module.css'

const AboutPage = () => {
  const [totalImages, setTotalImages] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const fetchImageCount = async () => {
    const res = await fetch(`/artbot/api/image-count`)
    const data = await res.json()
    if (data.totalImages) {
      setTotalImages(Number(data.totalImages))
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      fetchImageCount()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffectOnce(() => {
    fetchImageCount()
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/about'
    })
  })

  return (
    <div className={styles.AboutWrapper}>
      {showFeedback && (
        <Modal
          handleClose={() => setShowFeedback(false)}
          style={{ height: '520px' }}
          visible={showFeedback}
        >
          <FeedbackForm />
        </Modal>
      )}
      <Head>
        <title>About - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - About" />
      </Head>
      <PageTitle>About ArtBot</PageTitle>
      {totalImages ? (
        <div className="mb-4 text-lg font-bold">
          Total images generated: {totalImages.toLocaleString()}
        </div>
      ) : null}
      <div className="mt-2">
        <img
          className={styles.HeroImage}
          src="/artbot/painting_bot.png"
          alt="painting of a robot painting robots"
        />
        <div className={styles.HelpfulLinks}>
          <div
            className={styles.LinkButton}
            onClick={() => setShowFeedback(true)}
          >
            Contact / Feedback
          </div>
          |<Linker href="/changelog">Changelog</Linker>|
          <Linker href="/faq">FAQ</Linker>|
          <Linker href="/info">General Info</Linker>
        </div>
        <div className="mt-4">
          <Text>
            ArtBot is an unofficial front-end web client designed for
            interacting with the{' '}
            <Linker
              href="https://aihorde.net/"
              target="_blank"
              rel="noreferrer"
            >
              Stable Horde
            </Linker>{' '}
            distributed cluster.
          </Text>
        </div>

        <Text>
          Stable Horde is an open source platform that utilizes idle GPU power
          provided by a community of generous users that allows anyone to create
          generative AI artwork on their own computers or mobile devices. More
          information is available on the{' '}
          <Linker href="https://aihorde.net/" target="_blank" rel="noreferrer">
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
          </Linker>
          , on Mastodon at{' '}
          <Linker
            href="https://mastodon.world/@davely"
            target="_blank"
            rel="noopener noreferrer"
          >
            @davely@mastodon.world
          </Linker>{' '}
          or on Discord at{' '}
          <Linker
            href="https://discordapp.com/users/rockbandit#4910"
            target="_blank"
            rel="noopener noreferrer"
          >
            rockbandit#4910
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
        <h2 className="font-bold mb-2">Ways to contact me</h2>
        <ul>
          <li>
            Discord (ArtBot feedback):{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1107628882783391744"
              target="_blank"
              rel="noopener noreferrer"
            >
              ArtBot suggestions and feedback (Stable Horde Discord server)
            </Linker>
          </li>
          <li>
            Contact form:{' '}
            <Linker
              href=""
              onClick={() => setShowFeedback(true)}
              scroll={false}
            >
              open
            </Linker>
          </li>
          <li>
            Discord (Profile):{' '}
            <Linker
              href="https://discordapp.com/users/rockbandit#4910"
              target="_blank"
              rel="noopener noreferrer"
            >
              rockbandit#4910
            </Linker>
          </li>
          <li>
            GitHub:{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
              target="_blank"
              rel="noreferrer"
            >
              ArtBot Discussion and Issues
            </Linker>
          </li>
          <li>
            Mastodon:{' '}
            <Linker href="https://mastodon.world/@davely" target="_blank">
              @davely@mastodon.world
            </Linker>
          </li>
          <li>
            Twitter:{' '}
            <Linker
              href="https://twitter.com/davely"
              target="_blank"
              rel="noopener noreferrer"
            >
              @davely
            </Linker>
          </li>
        </ul>
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
    </div>
  )
}

export default AboutPage
