import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled render error', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center space-y-3">
            <h1 className="text-3xl font-serif font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              The simulation hit an unexpected issue. Please reload and continue from your save.
            </p>
            {this.state.message && (
              <pre className="text-xs text-left bg-muted p-3 rounded-md overflow-x-auto">
                {this.state.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
