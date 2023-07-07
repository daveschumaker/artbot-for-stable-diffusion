import { trackEvent } from '../api/telemetry'
import { useEffectOnce } from '../hooks/useEffectOnce'
import CreateHomePage from 'modules/CreateHomePage'

export async function getServerSideProps(context: any) {
  let availableModels: Array<any> = []
  let modelDetails: any = {}
  let shortlinkImageParams: any = ''

  const { query } = context
  const { i } = query

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

    if (i) {
      const res = await fetch(
        `http://localhost:${process.env.PORT}/artbot/api/get-shortlink?shortlink=${query.i}`
      )

      const data = (await res.json()) || {}
      console.log(i, data)
      const { imageParams } = data.imageParams || {}
      shortlinkImageParams = imageParams || null
    }
  } catch (err) {}

  return {
    props: {
      availableModels,
      modelDetails,
      shortlinkImageParams
    }
  }
}

const Home = ({ modelDetails, shortlinkImageParams }: any) => {
  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/home'
    })
  })

  return (
    <>
      <CreateHomePage
        modelDetails={modelDetails}
        shortlinkImageParams={shortlinkImageParams}
      />
    </>
  )
}

export default Home
