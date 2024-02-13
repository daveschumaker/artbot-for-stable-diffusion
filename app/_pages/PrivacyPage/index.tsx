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
      <div className="pb-2">
        <img
          src={`${basePath}/robot-towel.jpg`}
          alt="painting of a robot painting robots"
        />
      </div>
      <div className="pb-2">
        Last updated: February, 13, 2024 (
        <Linker
          href="https://github.com/daveschumaker/artbot-for-stable-diffusion/commits/main/app/_pages/PrivacyPage/index.tsx"
          target="_blank"
          rel="noreferrer"
        >
          view history
        </Linker>
        )
      </div>
      <div className="pb-2 font-[700]">Overview</div>
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
      <div className="pb-2 font-[700]">Data storage</div>
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
        the API key) is stored within an ArtBot specific database. Shared images
        are hosted on Amazon S3.
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
        ArtBot also uses Google Analytics for tracking page views and realtime
        usage. We are actively exploring alternatives to Google Analytics and
        are committed to enhancing user privacy.
      </div>
      <div className="pb-2">
        Lastly, while ArtBot is an enthusiastic supporter of the AI Horde, we
        cannot guarantee how data can potentially be used once it is sent to
        this service or what volunteer worker GPUs will do with it. You can view
        the AI Horde&apos;s privacy policy{' '}
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
      <div className="pb-2 font-[700]">Ownership</div>
      <div className="pb-2">
        ArtBot does not claim ownership of images created using the service.
        Your images are yours and you can do what you want with them. In terms
        of copyright, this is a matter that still remains to be settled. Courts
        in the United States have generally ruled that AI generated images
        cannot be copyrighted. However, the laws might change, and they might
        vary by jurisdiction. Again, ArtBot does not claim ownership or
        copyright over any images you create.
      </div>
      <div className="pb-2">
        (But if you&apos;ve done something cool using the ArtBot service or made
        some money with it, do let us know. We love to see what people are
        creating!)
      </div>
      <div className="pb-2 font-[700]">Questions</div>
      <div className="pb-2">
        If you have additional questions or comments, please{' '}
        <Linker href="/contact">get in touch</Linker>!
      </div>
    </>
  )
}

export default PrivacyPage
