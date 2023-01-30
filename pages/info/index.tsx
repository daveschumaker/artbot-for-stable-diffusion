import Head from 'next/head'
import Row from '../../components/Row'
import Linker from '../../components/UI/Linker'
import PageTitle from '../../components/UI/PageTitle'

const InfoPage = () => {
  return (
    <div className="mb-4">
      <Head>
        <title>General Information - ArtBot</title>
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>General Information</PageTitle>
        </div>
      </Row>
      <div>
        General information related to resources utilized by the Stable Horde.
      </div>
      <div className="mt-2">
        <ul>
          <li>
            <Linker href="/info/models" passHref>
              Model details
            </Linker>
          </li>
          <Linker href="/info/models?show=favorite-models" passHref>
            Favorite models
          </Linker>
          <li>
            <Linker href="/info/models/updates" passHref>
              Model updates
            </Linker>
          </li>
          <li>
            <Linker href="/info/workers" passHref>
              Worker details
            </Linker>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default InfoPage
