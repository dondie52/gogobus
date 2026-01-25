import React from 'react';
import { captureException } from '../../utils/sentry';
import { logError } from '../../utils/logger';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.jsx:12',message:'getDerivedStateFromError called',data:{errorMessage:error?.message,errorName:error?.name,errorStack:error?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.jsx:18',message:'componentDidCatch called',data:{errorMessage:error?.message,errorName:error?.name,errorStack:error?.stack?.substring(0,1000),componentStack:errorInfo?.componentStack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    logError('Error caught by boundary', { error, errorInfo });
    
    // Capture error in Sentry with additional context
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      props: this.props,
    });
  }

  render() {
    // #region agent log
    if (this.state.hasError) {
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.jsx:32',message:'ErrorBoundary rendering error UI',data:{errorMessage:this.state.error?.message,errorName:this.state.error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button
            onClick={() => {
              // #region agent log
              // #endregion
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className={styles.retryButton}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
