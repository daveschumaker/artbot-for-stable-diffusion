import Head from 'next/head'
import React from 'react'
import styled from 'styled-components'
import { userInfoStore } from 'app/_store/userStore'
import { logError } from 'app/_utils/appUtils'
import PageTitle from 'app/_components/PageTitle'
import { basePath } from 'BASE_PATH'
import { db } from 'app/_db/dexie'

const StyledLink = styled.a`
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

export const logErrorInComponent = (
  error: Error,
  info: { componentStack: string },
  componentName?: string
) => {
  const { username } = userInfoStore.state
  const errorMessage = []

  if (componentName) {
    errorMessage.push(`Component: ${componentName}`)
  }

  if (error?.message) {
    errorMessage.push(error.message)
  }

  logError({
    path: window.location.href,
    errorMessage: errorMessage.join('\n'),
    errorInfo: info?.componentStack,
    errorType: 'client-side',
    username
  })

  if (
    window.location.href.includes('/pending') &&
    errorMessage.includes(
      'The operation failed for reasons unrelated to the database itself'
    )
  ) {
    db.pending.clear()
  }
}

const ErrorComponent = () => {
  return (
    <>
      <Head>
        <title>Unexpected Error - ArtBot for Stable Diffusion</title>
      </Head>
      <PageTitle>An unexpected error has occurred.</PageTitle>
      <div className="mb-[8px]">
        ArtBot encountered an error while attempting to process this request.
        You can attempt to{' '}
        <StyledLink href={window.location.href}>reload this page</StyledLink>{' '}
        and see if the problem resolves itself.
      </div>
      <div className="mb-[8px]">
        Otherwise, this is probably Dave&apos;s fault. An error log has
        automatically been created.
      </div>
      <div className="mb-[8px]">
        Please hit the{' '}
        <StyledLink href={`${basePath}/contact`}>contact form</StyledLink> if
        you&apos;d like to provide more information about what happened or{' '}
        <StyledLink
          href="https://discord.com/channels/781145214752129095/1107628882783391744"
          target="_blank"
          rel="noopener noreferrer"
        >
          visit the ArtBot channel
        </StyledLink>{' '}
        on the{' '}
        <StyledLink
          href="https://discord.gg/3DxrhksKzn"
          target="_blank"
          rel="noreferrer"
        >
          Stable Horde Discord server
        </StyledLink>{' '}
        .
      </div>
    </>
  )
}

export default ErrorComponent
