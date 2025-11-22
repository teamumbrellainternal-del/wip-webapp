import React, { Component, ErrorInfo, ReactNode } from 'react'
import ServerErrorPage from '@/pages/ServerErrorPage'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })

    // TODO: Log to Sentry or other error tracking service
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    // }
  }

  public render() {
    if (this.state.hasError) {
      return <ServerErrorPage error={this.state.error} showDetails={import.meta.env.DEV} />
    }

    return this.props.children
  }
}
