import Link from 'next/link'
import React from 'react'
import LinkIcon from './icons/LinkIcon'
import Linker from './UI/Linker'
import { baseHost, basePath } from 'BASE_PATH'
import { showSuccessToast } from 'utils/notificationUtils'

const showToast = () => {
  showSuccessToast({ message: 'FAQ URL copied!' })
}

const MonoFont = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-2 font-mono py-[4px] px-[4px] bg-[#878787] text-sm">
      {children}
    </div>
  )
}

const Question = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-row justify-start items-start gap-[8px] mb-[8px] text-[20px] font-[700]">
      {children}
    </div>
  )
}

export const FaqKudos = () => {
  return (
    <div>
      <Question>
        <Linker
          href={`/faq#kudos`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#kudos`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" size={24} />
        </Linker>
        What are kudos and why do they exist?
      </Question>
      <div className="flex flex-col gap-4">
        <p>
          Kudos are essentially a point tracking system implemented within the
          backend of Stable Horde in order to determine queue priority and
          prevent general abuse of the service. Those who are logged in with a
          Stable Horde API key will get higher priority than anonymous users.
          Those who are logged in and have more kudos will get even higher
          priority in the queue.
        </p>
        <p>
          <strong>** They are not a currency and cannot be bought. **</strong>{' '}
        </p>
        <p>
          They are awarded to users for contributing GPU power to the
          distributed cluster. Other ways to get kudos are to{' '}
          <Linker href="/rate">rate images</Linker> for aesthetics training ,
          participate in the{' '}
          <Linker
            href="https://discord.com/channels/781145214752129095/1027506429139095562"
            target="_blank"
          >
            Stable Horde Discord channel
          </Linker>{' '}
          -- by being a helpful member of the community or sharing neat art that
          you&apos;ve generated.
        </p>
        <p>
          Some image generation parameters (e.g., those determined to be more
          computationaly expensive operations, such as higher resolution images
          or more steps) require an upfront kudos balance. However, most
          operations can be completed without needing the required amount of
          kudos upfront. (Most requests that are less than ~17 kudos can be
          completed without issue.)
        </p>
        <p>
          More information about how kudos are used and the philosophy behind
          them can be found{' '}
          <Linker
            href="https://dbzer0.com/blog/the-kudos-based-economy-for-the-koboldai-horde/"
            target="_blank"
          >
            here
          </Linker>
          .
        </p>
      </div>
    </div>
  )
}

export const FaqSyntax = () => {
  return (
    <div>
      <Question>
        <Linker
          href={`/faq#syntax`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#syntax`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Is there any sort of syntax (prompt weights or prompt matrix)?
      </Question>
      <div className="flex flex-col gap-4">
        <p>
          Prompt weighting is available on ArtBot thanks to the Stable Horde. To
          utilize prompt weighting, use the following syntax: subject in
          parenthesis separated by a colon, followed by a number. e.g.,
          (flower:1.2) Example:
          <MonoFont>
            A beautiful photograph of a (blue:1.2) and (red:0.8) flower
          </MonoFont>
        </p>
        <p>
          Any integer greater than 1.0 denotes something you want to give extra
          strength to (e.g., 1.2 = 120%). Anything below 1.0 is something you
          want to deemphasize. Other Stable Diffusion UIs, such as
          Automatic1111, utilize multiple parens and brackets (e.g.,
          ((stronger)) and [[[weaker]]]). That syntax is <strong>not</strong>{' '}
          supported on ArtBot.
        </p>
        <p>
          ArtBot also supports using a prompt matrix -- anything inside brackets
          separated by a pipe character. That looks like this:{' '}
          <MonoFont>{`{thing one|thing two|thing three}`}</MonoFont>
        </p>
        <p>
          Each value will be run separately (and against any other values, if
          provided).For example, the following query will yield 6 images:
          <MonoFont>
            A beautiful forest full of {`{bears|clowns}`}, painted by{' '}
            {`{Bob Ross|Thomas Kinkade|Maurice Sendak}`}
          </MonoFont>
        </p>
      </div>
    </div>
  )
}

export const FaqEstimatedTime = () => {
  return (
    <div>
      <Question>
        <Linker
          href={`/faq#generation-time`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#generation-time`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Why does the estimated time remaining to generate an image seem to
        fluctuate so much?
      </Question>
      <div className="">
        This generally happens if you&apos;re an anonymous user. Stable Horde
        uses a priority queue system. Users who provide an API key and have
        kudos are given priority access to the job queue ahead of anonymous
        users. As such, your image request might be shuffled back in the queue
        if a valid registered user creates an image request.
      </div>
    </div>
  )
}

export const FaqMissingRequests = () => {
  return (
    <div>
      <Question>
        <Linker
          href={`/faq#requests-missing`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#requests-missing`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Why do my pending image requests sometimes disappear without generating
        an image?
      </Question>
      <div className="">
        In order to keep image generation requests moving along, Stable Horde
        drops any outstanding request after about 10 minutes. If your job is
        older than 20 minutes, it may disappear.
      </div>
    </div>
  )
}

export const FaqBlackImage = () => {
  return (
    <div>
      <Question>
        {' '}
        <Linker
          href={`/faq#black-image`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#kudos`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Why am I getting a black image?
      </Question>
      <div className="">
        You&apos;re probably running into the Stable Diffusion / Stable Horde
        NSFW filter. It can sometimes be a bit too aggressive. Try disabling it
        in the{' '}
        <Link href="/settings" className="text-cyan-500">
          settings panel
        </Link>
        .
      </div>
    </div>
  )
}

export const FaqStorageExceeded = () => {
  return (
    <div>
      <Question>
        <Linker
          href={`/faq#storage-exceeded`}
          onClick={() => {
            navigator?.clipboard
              ?.writeText(`${baseHost}${basePath}/faq/#storage-exceeded`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Why am I getting a &quot;web app exceeded storage quota error&quot;?
      </Question>
      <div className="flex flex-col gap-4">
        <p>
          Various operating systems and browsers impose limits on the amount of
          storage that can be utilized by a particular web app. If you&apos;ve
          received this error, you&apos;ll need to remove images from your
          browser&apos;s ArtBot database instance before continuing. Sadly, this
          is a browser and device operating system issue that ArtBot cannot
          workaround.
        </p>
        <p>After removing some images, please reload the app and try again.</p>
        <p>--</p>
        <p>
          The always helpful{' '}
          <Linker
            href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#Storage_limits"
            target="_blank"
            rel="noopener noreferrer"
          >
            MDN web docs
          </Linker>{' '}
          have more information about this particular issue.
        </p>
        <p>
          In summary, on iOS, web apps installed on your homescreen (a.k.a. a
          PWA -- progressive web app) have a hard limit of 1GB of storage space,
          however if using a web app through the Safari browser (or Firefox /
          Chrome / etc... which all utilize Safari&apos;s engine as of this
          writing), initially limit to 1GB of space, but can request more
          storage from the user.
        </p>
        <p>
          On other operating systems and browsers, which don&apos;t act like
          FisherPrice toys, you have a limit of 10% of diskspace (or 10GB,
          whichever is smaller) on Firefox and up to 60% of available diskspace
          in Chrome based browsers.
        </p>
        <p>
          (Note about FisherPrice toys -- this web app is primarily developed
          using one...)
        </p>
        <p>
          In the future, I will add some more helpful storage management options
          to ArtBot.
        </p>
        <p>
          <strong>IMPORTANT NOTE:</strong> After deleting images from the
          gallery, you might still get quote exceeded errors. This is because
          browser APIs don&apos; t expose a way to run garbage collection on
          IndexDb. This happens automatically... at some point in time. Wait a
          few minutes and try again. I really wish this would be more intuitive.
        </p>
      </div>
    </div>
  )
}
