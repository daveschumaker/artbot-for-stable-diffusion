import Head from 'next/head'
import Link from 'next/link'
import PageTitle from '../components/PageTitle'

const FaqPage = () => {
  return (
    <>
      <Head>
        <title>ArtBot - FAQ</title>
      </Head>
      <PageTitle>FAQ</PageTitle>
      <div className="text-md">
        <div className="mt-2 font-bold">
          Q: Is img2img live? How do I use it?
        </div>
        <div className="">
          A: Db0 has release img2img support through the Stable Horde as a
          pilot. You can currently use it if you are considered a trusted user
          within Stable Horde. One way to do that is to contribute GPU cycles
          toward the distributed cluster. More information is available{' '}
          <a
            className="text-cyan-500"
            href="https://github.com/db0/AI-Horde/blob/main/FAQ.md"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </div>
        <div className="mt-2 font-bold">
          Q: Why does the estimated time remaining to generate an image seem to
          fluctuate so much?
        </div>
        <div className="">
          A: This generally happens if you&apos;re an anonymous user. Stable
          Horde uses a priority queue system. Users who provide an API key and
          have kudos are given priority access to the job queue ahead of
          anonymous users. As such, your image request might be shuffled back in
          the queue if a valid registered user creates an image request.
        </div>
        <div className="mt-2 font-bold">
          Q: Why do my pending image requests sometimes disappear without
          generating an image?
        </div>
        <div className="">
          A: In order to keep image generation requests moving along, Stable
          Horde drops any outstanding request after about 10 minutes. If your
          job is older than 10 minutes, it may disappear.
        </div>
        <div className="mt-2 font-bold">Q: Why am I getting a black image?</div>
        <div className="">
          A: You&apos;re probably running into the Stable Diffusion / Stable
          Horde NSFW filter. It can sometimes be a bit too aggressive. Try
          disabling it in the{' '}
          <Link href="/settings">
            <a className="text-cyan-500">settings panel</a>
          </Link>
          .
        </div>
      </div>
    </>
  )
}

export default FaqPage
