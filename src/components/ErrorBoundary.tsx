import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 16,
          padding: 32,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 32 }}>⚠️</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1B3A6B' }}>Algo salió mal</h2>
          <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 400 }}>
            Ocurrió un error inesperado. Recarga la página o contacta soporte si persiste.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
