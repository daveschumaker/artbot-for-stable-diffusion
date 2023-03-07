import Head from 'next/head'
import { useRouter } from 'next/router'
import InfoPageMenuButton from '../../../components/InfoPage/Menu'
import ModelInfoPage from '../../../components/ModelInfoPage'
import Row from '../../../components/Row'
import PageTitle from '../../../components/UI/PageTitle'

export async function getServerSideProps() {
  let availableModels: Array<any> = []
  let modelDetails: any = {}

  try {
    const availableModelsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/available`
    )
    const availableModelsData = (await availableModelsRes.json()) || {}
    availableModels = availableModelsData.models

    const modelDetailsRes = await fetch(
      `http://localhost:${process.env.PORT}/artbot/api/v1/models/details`
    )
    const modelDetailsData = (await modelDetailsRes.json()) || {}
    modelDetails = modelDetailsData.models
  } catch (err) {}

  return {
    props: {
      availableModels,
      modelDetails
    }
  }
}

const InfoPage = ({ availableModels, modelDetails }: any) => {
  const router = useRouter()

  const getMenuTitle = () => {
    if (
      Array.isArray(router?.query?.infoSource) &&
      router?.query?.infoSource[0] === 'workers'
    ) {
      return 'All workers'
    }

    if (router.query.show === 'favorite-models') {
      return `Favorite models`
    }

    return 'All models'
  }

  return (
    <div className="mb-4">
      <Head>
        <title>Stable Horde Model Details - ArtBot</title>
        <meta
          name="twitter:title"
          content="Model Information for Stable Horde"
        />
        <meta
          name="twitter:description"
          content="Detailed information for all Stable Diffusion models currently available on Stable Horde."
        />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robot_clipboard.png"
        />
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          {router.query.show === 'favorite-models' ? (
            <PageTitle>Favorite Models</PageTitle>
          ) : (
            <PageTitle>Model Details</PageTitle>
          )}
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <InfoPageMenuButton title={getMenuTitle()} />
        </div>
      </Row>
      <ModelInfoPage
        availableModels={availableModels}
        modelDetails={modelDetails}
      />
    </div>
  )
}

export default InfoPage
