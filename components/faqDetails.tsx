import Link from 'next/link'
import React from 'react'
import { toast } from 'react-toastify'
import LinkIcon from './icons/LinkIcon'
import Linker from './UI/Linker'

const showToast = () => {
  toast.success('FAQ URL copied!', {
    pauseOnFocusLoss: false,
    position: 'top-center',
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'light'
  })
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
              ?.writeText(`https://tinybots.net/artbot/faq/#kudos`)
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
              ?.writeText(`https://tinybots.net/artbot/faq/#syntax`)
              ?.then(() => showToast())
          }}
        >
          <LinkIcon className="cursor-pointer mt-1" />
        </Linker>
        Is there any sort of syntax (prompt weights or prompt matrix)?
      </Question>
      <div className="flex flex-col gap-4">
        <p>
          As currently implemented, prompt weighting does not exist on Stable
          Horde. However, syntax for prompt weighting using the Stable Horde API
          is coming soon.
        </p>
        <p>
          Currently, the only syntax supported through ArtBot is using a prompt
          matrix -- anything inside brackets separated by a pipe character. That
          looks like this:{' '}
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
              ?.writeText(`https://tinybots.net/artbot/faq/#generation-time`)
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
              ?.writeText(`https://tinybots.net/artbot/faq/#requests-missing`)
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
              ?.writeText(`https://tinybots.net/artbot/faq/#kudos`)
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
