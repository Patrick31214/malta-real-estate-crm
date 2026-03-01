import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#3C2010',
          color: '#fff5e6',
          fontFamily: 'inherit',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            border: '1px solid rgba(196,135,90,0.3)',
            borderRadius: 12,
            padding: '2.5rem',
            maxWidth: 480,
            background: 'rgba(138,90,50,0.08)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#C4875A', marginBottom: 8, fontSize: '1.4rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#c4a882', marginBottom: 24, fontSize: '0.9rem' }}>
              An unexpected error occurred. Please try reloading the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: 6,
                padding: '0.75rem',
                fontSize: '0.75rem',
                color: '#e74c3c',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: 24,
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #8A5A32, #B8864E)',
                border: '1px solid rgba(196,135,90,0.4)',
                borderRadius: 8,
                color: '#C4875A',
                padding: '0.6rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
