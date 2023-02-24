import Head from 'next/head'
import { trackEvent } from '../api/telemetry'
import {
  FaqBlackImage,
  FaqEstimatedTime,
  FaqKudos,
  FaqMissingRequests,
  FaqSyntax
} from '../components/faqDetails'
import PageTitle from '../components/UI/PageTitle'
import Panel from '../components/UI/Panel'
import { useEffectOnce } from '../hooks/useEffectOnce'

const FaqPage = () => {
  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/faq'
    })
  })

  return (
    <div className="mb-4">
      <Head>
        <title>FAQ - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - FAQ" />
      </Head>
      <PageTitle>FAQ</PageTitle>
      <div className="text-md flex flex-col gap-4">
        <Panel>
          <a id="kudos" />
          <FaqKudos />
        </Panel>
        <Panel>
          <a id="syntax" />
          <FaqSyntax />
        </Panel>
        <Panel>
          <a id="generation-time" />
          <FaqEstimatedTime />
        </Panel>
        <Panel>
          <a id="requests-missing" />
          <FaqMissingRequests />
        </Panel>
        <Panel>
          <a id="black-image" />
          <FaqBlackImage />
        </Panel>
      </div>
    </div>
  )
}

export default FaqPage
