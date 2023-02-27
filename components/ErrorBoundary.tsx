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

    console.log(error)

    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
    logError({
      path: window.location.href,
      errorInfo: errorInfo?.componentStack,
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
          <div>
            ArtBot encountered an error while attempting to process this
            request.
          </div>

          <div>
            This is probably Dave&apos;s fault. An error log has automatically
            been created.
          </div>

          <div className="mt-[8px]">
            Please visit the{' '}
            <StyledLink href="/artbot/contact">contact form</StyledLink> if
            you&apos;d like to provide more information about what happened.
          </div>
        </>
      )
    }

    // @ts-ignore
    return this.props.children
  }
}

export default ErrorBoundary
