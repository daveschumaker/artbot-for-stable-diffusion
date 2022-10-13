/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import PageTitle from '../components/PageTitle'

const AboutPage = () => {
  return (
    <>
      <PageTitle>About</PageTitle>
      <div className="mt-2">
        <img
          src="/artbot/painting_bot.png"
          alt="painting of a robot painting robots"
        />
        <div className="mt-2">
          ArtBot is an open source front-end client written with Next.js, for
          interacting with the{' '}
          <a
            href="https://stablehorde.net/"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            Stable Horde
          </a>{' '}
          distributed cluster.
        </div>
        <div className="mt-2">
          This web app utilizes{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
            target="_blank"
            className="text-cyan-400"
            rel="noreferrer"
          >
            IndexedDB
          </a>{' '}
          and LocalStorage APIs to privately store your AI generated images
          created using the cluster within your own browser.
        </div>
        <div className="mt-2">
          This front-end web app is written and maintained by{' '}
          <Link href="https://twitter.com/davely">
            <a
              className="text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              dave.ly
            </a>
          </Link>
          . The source code is available on{' '}
          <a
            href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400"
          >
            Github
          </a>{' '}
          and contributions are welcome!
        </div>
      </div>
    </>
  )
}

export default AboutPage
