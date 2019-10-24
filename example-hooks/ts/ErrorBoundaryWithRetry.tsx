import * as React from "react"

interface Props {
  fallback: (error: Error) => JSX.Element
}

class ErrorBoundaryWithRetry extends React.Component<Props> {
  state = { error: null }

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
        return fallback(error, this._retry)
      }
      return fallback
    }
    return children
  }
}

export default ErrorBoundaryWithRetry
