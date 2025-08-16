import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real app, you would send this to an error tracking service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      component: this.props.componentName || 'Unknown'
    };

    // For development, log to console
    if (import.meta.env.MODE === 'development') {
      console.group('🚨 Error Boundary Report');
      console.log('Error ID:', errorReport.errorId);
      console.log('Component:', errorReport.component);
      console.error('Error:', error);
      console.log('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // In production, send to error tracking service
    if (this.props.onError) {
      this.props.onError(errorReport);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error Details:
- Error ID: ${this.state.errorId}
- Component: ${this.props.componentName || 'Unknown'}
- Message: ${this.state.error?.message || 'Unknown error'}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

`);
    
    const mailto = `mailto:support@ceylonsmartcitizen.com?subject=${subject}&body=${body}`;
    window.open(mailto);
  };

  render() {
    if (this.state.hasError) {
      // Determine error severity and type
      const isNetworkError = this.state.error?.name === 'NetworkError' || 
                           this.state.error?.message?.includes('fetch');
      const isComponentError = this.state.error?.name === 'ChunkLoadError' || 
                             this.state.errorInfo?.componentStack;
      
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            
            <div className="error-boundary-text">
              <h2 className="error-boundary-title">
                {isNetworkError ? 'Connection Problem' :
                 isComponentError ? 'Something went wrong' :
                 'Unexpected Error'}
              </h2>
              
              <p className="error-boundary-message">
                {isNetworkError ? 
                  'Unable to connect to our services. Please check your internet connection and try again.' :
                  this.props.fallbackMessage || 
                  'We encountered an unexpected error. Our team has been notified and is working on a fix.'}
              </p>

              {import.meta.env.MODE === 'development' && (
                <details className="error-boundary-details">
                  <summary>Error Details (Development)</summary>
                  <pre className="error-boundary-stack">
                    <strong>Error:</strong> {this.state.error?.message}
                    {'\n\n'}
                    <strong>Stack:</strong>
                    {'\n'}{this.state.error?.stack}
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}{this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="error-boundary-actions">
              <button
                onClick={this.handleRetry}
                className="error-boundary-button error-boundary-button--primary"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              {!this.props.hideHomeButton && (
                <button
                  onClick={this.handleGoHome}
                  className="error-boundary-button error-boundary-button--secondary"
                >
                  <Home size={16} />
                  Go Home
                </button>
              )}

              <button
                onClick={this.handleReportBug}
                className="error-boundary-button error-boundary-button--ghost"
              >
                <Bug size={16} />
                Report Bug
              </button>
            </div>

            {this.state.errorId && (
              <div className="error-boundary-id">
                Error ID: {this.state.errorId}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <ErrorBoundary
      componentName={options.componentName || Component.displayName || Component.name}
      fallbackMessage={options.fallbackMessage}
      onError={options.onError}
      hideHomeButton={options.hideHomeButton}
      userId={options.userId}
    >
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error reporting in functional components
export const useErrorHandler = (componentName) => {
  const reportError = React.useCallback((error, errorInfo = {}) => {
    const errorReport = {
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      component: componentName,
      ...errorInfo
    };

    console.error('Error reported from component:', componentName, error);
    
    // Here you would typically send to an error tracking service
    return errorReport;
  }, [componentName]);

  return { reportError };
};

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
    this.setState({ hasError: true });
  }

  componentDidMount() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Only set error state if it's related to our component
    if (this.props.catchAsyncErrors) {
      this.setState({ hasError: true });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundary
          componentName={this.props.componentName}
          fallbackMessage="An error occurred while loading data. Please try again."
          onError={this.props.onError}
        >
          <div>Error occurred in async operation</div>
        </ErrorBoundary>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
