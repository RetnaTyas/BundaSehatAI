import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', 
          fontFamily: 'system-ui, sans-serif', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          textAlign: 'center',
          backgroundColor: '#fff1f2',
          color: '#881337'
        }}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Ada Masalah Sedikit...</h1>
          <p style={{marginBottom: '1rem'}}>Aplikasi mengalami error. Mohon refresh halaman.</p>
          <pre style={{
            backgroundColor: 'white', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.75rem', 
            maxWidth: '100%', 
            overflow: 'auto',
            border: '1px solid #fecdd3'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1.5rem', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#fb7185', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);