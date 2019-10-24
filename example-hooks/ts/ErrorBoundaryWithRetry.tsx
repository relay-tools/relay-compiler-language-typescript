import * as React from "react"

interface Props {
  fallback: (error: Error, retryFn: () => void) => JSX.Element
}
interface State {
  error: Error | null
}

class ErrorBoundaryWithRetry extends React.Component<Props, State> {
  state = { error: null }

  // @ts-ignore
  static getDerivedStateFromError(error) {
    return { error: error }
  }

  _retry = () => {
    this.setState({ error: null })
  }

  render() {
    const { children, fallback } = this.props
    const { error } = this.state

    if (error) {
      if (typeof fallback === "function") {
        return fallback(error!, this._retry)
      }
      return fallback
    }
    return children
  }
}

export default ErrorBoundaryWithRetry
