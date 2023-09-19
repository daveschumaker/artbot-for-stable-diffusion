'use client' // Error components must be Client Components

import { useEffect } from 'react'
import PageTitle from './_components/PageTitle'
import Linker from 'app/_components/Linker'
import ContentWrapper from './_components/ContentWrapper'
import MaxWidth from './_components/MaxWidth'
import { basePath } from 'BASE_PATH'

export default function Error({
  error
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ContentWrapper>
      <MaxWidth>
        <PageTitle>An unexpected error has occurred.</PageTitle>
        <div className="mb-[8px]">
          ArtBot encountered an error while attempting to process this request.
        </div>
        <div className="mb-[8px]">
          Otherwise, this is probably Dave&apos;s fault. An error log has
          automatically been created.
        </div>
        <div className="mb-[8px]">
          Please hit the{' '}
          <Linker href={`${basePath}/contact`}>contact form</Linker> if
          you&apos;d like to provide more information about what happened or{' '}
          <Linker
            href="https://discord.com/channels/781145214752129095/1107628882783391744"
            target="_blank"
            rel="noopener noreferrer"
          >
            visit the ArtBot channel
          </Linker>{' '}
          on the{' '}
          <Linker
            href="https://discord.gg/3DxrhksKzn"
            target="_blank"
            rel="noreferrer"
          >
            Stable Horde Discord server
          </Linker>{' '}
          .
        </div>
      </MaxWidth>
    </ContentWrapper>
  )
}
