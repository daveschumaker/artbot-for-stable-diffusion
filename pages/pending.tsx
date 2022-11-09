import Head from 'next/head'
import PendingPageComponent from '../components/PendingPage'

const PendingPage = () => {
  return (
    <>
      <Head>
        <title>ArtBot - Pending images</title>
      </Head>
      <PendingPageComponent />
    </>
  )
}

export default PendingPage
