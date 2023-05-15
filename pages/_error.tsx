/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import PageTitle from '../components/UI/PageTitle'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { userInfoStore } from '../store/userStore'
import { logError } from '../utils/appUtils'

const StyledLink = styled.a`
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

export default function ErrorPage({ err }: { err: any }) {
  const router = useRouter()

  useEffectOnce(() => {
    const { username } = userInfoStore.state

    let errorInfo = ''

    if (err) {
      errorInfo = JSON.stringify(err, Object.getOwnPropertyNames(err))
    }

    logError({
      username,
      path: `${router.basePath}${router.asPath}`,
      errorMessage: err?.message,
      errorInfo,
      errorType: 'server-side'
    })
  })

  return (
    <div>
      <Head>
        <title>Unexpected Error - ArtBot for Stable Diffusion</title>
      </Head>
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
        <StyledLink href="/artbot/contact">contact form</StyledLink> if
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
    </div>
  )
}
