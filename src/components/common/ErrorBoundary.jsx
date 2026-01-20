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
    // #endregion
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // #region agent log
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
