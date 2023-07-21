'use client'

import Head from 'next/head'
import { useSearchParams } from 'next/navigation'
import InfoPageMenuButton from 'components/InfoPage/Menu'
import ModelInfoPage from 'components/ModelInfoPage'
import Row from 'components/Row'
import PageTitle from 'app/_components/PageTitle'
import AppSettings from 'models/AppSettings'

// export async function getServerSideProps() {
//   let availableModels: Array<any> = []
//   let modelDetails: any = {}

//   try {
//     const availableModelsRes = await fetch(
//       `http://localhost:${process.env.PORT}/artbot/api/v1/models/available`
//     )
//     const availableModelsData = (await availableModelsRes.json()) || {}
//     availableModels = availableModelsData.models

//     const modelDetailsRes = await fetch(
//       `http://localhost:${process.env.PORT}/artbot/api/v1/models/details`
//     )
//     const modelDetailsData = (await modelDetailsRes.json()) || {}
//     modelDetails = modelDetailsData.models
//   } catch (err) {}

//   return {
//     props: {
//       availableModels,
//       modelDetails
//     }
//   }
// }

const InfoPage = ({ availableModels, modelDetails }: any) => {
  const searchParams = useSearchParams()

  const getMenuTitle = () => {
    if (searchParams?.get('show') === 'workers') {
      return `All workers`
    }

    if (searchParams?.get('show') === 'favorite-models') {
      return `Favorite models`
    }

    return 'All models'
  }

  const handleClearFavoriteModels = () => {
    AppSettings.set('favoriteModels', {})
    window.location.reload()
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
          {searchParams?.get('show') === 'favorite-models' ? (
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
      {searchParams?.get('show') === 'favorite-models' && (
        <div>
          <div
            onClick={handleClearFavoriteModels}
            style={{
              cursor: 'pointer',
              color: 'var(--link-text)',
              fontWeight: '600'
            }}
          >
            [ clear favorite models ]
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoPage
