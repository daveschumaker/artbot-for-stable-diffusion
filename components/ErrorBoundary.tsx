import React from 'react'

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

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
    console.log(`--- ERROR`)
    console.log(error)
    console.log(errorInfo)
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    // @ts-ignore
    return this.props.children
  }
}

export default ErrorBoundary
