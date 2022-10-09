import PageTitle from '../components/PageTitle'

const AboutPage = () => {
  return (
    <>
      <PageTitle>About</PageTitle>
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
        distributed cluster. This web app utilizes{' '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
          target="_blank"
          className="text-cyan-400"
          rel="noreferrer"
        >
          IndexedDB
        </a>{' '}
        and LocalStorage for viewing and persisting any images created using the
        cluster.
      </div>
    </>
  )
}

export default AboutPage
