import React from 'react'
import styled from 'styled-components'
import { userInfoStore } from '../store/userStore'
import { logError } from '../utils/appUtils'
import PageTitle from './UI/PageTitle'

const StyledLink = styled.a`
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any = {}) {
    const { username } = userInfoStore.state

    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
    logError({
      path: window.location.href,
      errorMessage: error?.message,
      errorInfo: errorInfo?.componentStack,
      errorType: 'client-side',
      username
    })
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <PageTitle>An unexpected error has occurred.</PageTitle>
          <div className="mb-[8px]">
            ArtBot encountered an error while attempting to process this
            request. You can attempt to{' '}
            <StyledLink href={window.location.href}>
              reload this page
            </StyledLink>{' '}
            and see if the problem resolves itself.
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
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
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

    // @ts-ignore
    return this.props.children
  }
}

export default ErrorBoundary
