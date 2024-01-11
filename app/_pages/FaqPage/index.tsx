'use client'

import Head from 'next/head'
import { trackEvent } from 'app/_api/telemetry'
import {
  FaqApiKey,
  FaqBlackImage,
  FaqEstimatedTime,
  FaqKudos,
  FaqMissingRequests,
  FaqRunWorker,
  FaqStorageExceeded,
  FaqSyntax
} from 'app/_modules/faqDetails'
import PageTitle from 'app/_components/PageTitle'
import Panel from 'app/_components/Panel'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'

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
        <a id="kudos" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqKudos />
        </Panel>
        <a id="get-apikey" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqApiKey />
        </Panel>
        <a id="syntax" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqSyntax />
        </Panel>
        <a id="run-worker" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqRunWorker />
        </Panel>
        <a id="generation-time" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqEstimatedTime />
        </Panel>
        <a id="requests-missing" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqMissingRequests />
        </Panel>
        <a id="black-image" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqBlackImage />
        </Panel>
        <a id="storage-exceeded" />
        <Panel style={{ borderWidth: '1px' }}>
          <FaqStorageExceeded />
        </Panel>
      </div>
    </div>
  )
}

export default FaqPage
