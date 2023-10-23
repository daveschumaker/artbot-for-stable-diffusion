'use client'

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import PageTitle from 'app/_components/PageTitle'
import { baseHost, basePath } from 'BASE_PATH'
import Linker from 'app/_components/Linker'

const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Privacy Policy" />
        <meta
          name="twitter:image"
          content={`${baseHost}${basePath}/robot_towel.jpg`}
        />
      </Head>
      <PageTitle>Privacy Policy</PageTitle>
      <div className="pb-2">Last updated: October, 23, 2023</div>
      <div className="pb-2">
        ArtBot is a web app that interfaces with the{' '}
        <Linker href="https://aihorde.net/" target="_blank" rel="noreferrer">
          AI Horde
        </Linker>
        , a third party open source API that uses a distributed network of GPUs
        contributed by enthusiastic volunteers. ArtBot intends to be a good
        citizen amongst the generative AI art community and tries to limit
        tracking and ensure user privacy where possible.
      </div>
      <div className="pb-2">
        This document represents a best effort that details what ArtBot does and
        does not do with any data you input into this service.
      </div>
      <div className="pb-2 font-[700]">Overview</div>
      <div className="pb-2">
        In general, ArtBot does not store or track the prompts you use for
        creating images, nor does it store the images you create, nor does it
        store personally identifiable information such as AI Horde API keys,
        usernames, or IP addresses.
      </div>
      <div className="pb-2">
        Any images you create are stored locally in your browser&apos;s
        IndexedDb implementation. Your API key is stored in your browser&apos;s
        local storage.
      </div>
      <div className="pb-2">
        The only exception to the above statements are when you click the &apos;
        <em>share</em>&apos; button on an image. This requires calling a
        specific ArtBot endpoint in order to save the data and make it available
        for others. In this case, all data used to create an image (except for
        the API key) is stored within an ArtBot specific database.
      </div>
      <div className="pb-2">
        No one else has access to this database and usernames are not shown when
        an image is publicly shared. Keep in mind that the link to a shared
        image is a public link, so anyone with the URL will have access to this
        image. You can see an example of a shared image{' '}
        <Linker href="https://tinybots.net/artbot?i=82kg83K26w7">here</Linker>.
      </div>
      <div className="pb-2 font-[700]">User telemetry</div>
      <div className="pb-2">
        In terms of other data that is tracked, ArtBot uses its own telemetry
        system for tracking various user behaviors. Generally, these behaviors
        are specific to new features that get rolled out in order to gauge
        usage.
      </div>
      <div className="pb-2">
        For those curious, you can see a current view of what is tracked by
        ArtBot by searching Github for ArtBot&apos;s{' '}
        <Linker
          href="https://github.com/search?q=repo%3Adaveschumaker%2Fartbot-for-stable-diffusion%20trackEvent&type=code"
          target="_blank"
          rel="noreferrer"
        >
          event tracking method
        </Linker>
        . No one besides ArtBot&apos;s lead developer has access to this
        information and it is automatically deleted from the telemetry tracking
        service after 30 days.
      </div>
      <div className="pb-2">
        No personally identifiable information is stored by this service. ArtBot
        assigns a random UUID that is passed along to the telemetry service in
        order to track some of the events mentioned above, however this UUID is
        not mapped to AI Horde API keys, usernames, or IP addresses.
      </div>
      <div className="pb-2 font-[700]">Third-party services</div>
      <div className="pb-2">
        Currently, ArtBot uses tools from a few third-party services and is
        unable to control what data those services may collect. This includes
        the{' '}
        <Linker href="https://aihorde.net/" target="_blank" rel="noreferrer">
          Carbon ads network
        </Linker>{' '}
        for displaying the ad. Their privacy policy is located{' '}
        <Linker
          href="https://www.buysellads.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          here
        </Linker>
        .
      </div>
      <div className="pb-2">
        ArtBot also uses Google Analytics for tracking page views and realtime
        usage. Longer term, we would like to move away from this.
      </div>
      <div className="pb-2">
        Lastly, while ArtBot is an enthusiastic supporter of the AI Horde, we
        cannot guarantee how data can potentially be used once it is sent to
        this service or what volunteer worker GPUs will do with it. You can view
        the AI Horde&apos;s privacy policy
        <Linker
          href="https://aihorde.net/privacy"
          target="_blank"
          rel="noreferrer"
        >
          here
        </Linker>
        .
      </div>
      <div className="pb-2">
        In general, use your best judgement when generating images.
      </div>
    </>
  )
}

export default PrivacyPage
