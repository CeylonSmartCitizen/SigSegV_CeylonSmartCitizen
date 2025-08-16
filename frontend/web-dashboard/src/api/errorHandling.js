// Error types enumeration
const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// ErrorHandler class for managing application errors
class ErrorHandler {
  constructor() {
    this.errorSubscribers = new Set();
    this.errorHistory = [];
    this.retryAttempts = new Map();
    this.maxHistorySize = 100;
    
    // Setup global error handling
    this.setupGlobalErrorHandling();
  }

  // Setup global error handling
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        originalError: event.reason,
        context: 'unhandled_promise_rejection'
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        originalError: event.error,
        context: 'global_error'
      });
    });
  }

  // Main error handling method
  async handleError(error, context = {}) {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const processedError = {
      id: errorId,
      timestamp,
      type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      originalError: error,
      context,
      userMessage: this.getUserFriendlyMessage(error),
      isRetryable: this.isRetryableError(error),
      retryOptions: this.getRetryOptions(error, context)
    };

    // Add to error history
    this.addToHistory(processedError);

    // Log error for debugging
    this.logError(processedError);

    // Notify subscribers
    this.notifySubscribers('error', processedError);

    // Check if this error is retryable
    const { isRetryable, retryOptions } = processedError;

    return {
      errorId,
      processedError,
      isRetryable,
      retryOptions
    };
  }

  // Check if error is retryable
  isRetryableError(error) {
    const retryableTypes = [
      ERROR_TYPES.NETWORK_ERROR,
      ERROR_TYPES.TIMEOUT_ERROR,
      ERROR_TYPES.SERVICE_UNAVAILABLE
    ];

    return retryableTypes.includes(error.type) || 
           (error.status && error.status >= 500);
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    const messages = {
      [ERROR_TYPES.NETWORK_ERROR]: {
        title: 'Connection Problem',
        message: 'Unable to connect to our services. Please check your internet connection and try again.'
      },
      [ERROR_TYPES.TIMEOUT_ERROR]: {
        title: 'Request Timeout',
        message: 'The request is taking longer than expected. Please try again.'
      },
      [ERROR_TYPES.AUTHENTICATION_ERROR]: {
        title: 'Authentication Required',
        message: 'Please log in to continue.'
      },
      [ERROR_TYPES.AUTHORIZATION_ERROR]: {
        title: 'Access Denied',
        message: 'You don\'t have permission to access this resource.'
      },
      [ERROR_TYPES.VALIDATION_ERROR]: {
        title: 'Invalid Data',
        message: 'Please check your input and try again.'
      },
      [ERROR_TYPES.NOT_FOUND_ERROR]: {
        title: 'Not Found',
        message: 'The requested resource could not be found.'
      },
      [ERROR_TYPES.CONFLICT_ERROR]: {
        title: 'Conflict',
        message: 'There was a conflict with your request.'
      },
      [ERROR_TYPES.RATE_LIMIT_ERROR]: {
        title: 'Too Many Requests',
        message: 'Please wait a moment before trying again.'
      },
      [ERROR_TYPES.SERVICE_UNAVAILABLE]: {
        title: 'Service Unavailable',
        message: 'Our services are temporarily unavailable. Please try again later.'
      },
      [ERROR_TYPES.BOOKING_CONFLICT]: {
        title: 'Booking Conflict',
        message: 'The selected time slot is no longer available.'
      },
      [ERROR_TYPES.PAYMENT_ERROR]: {
        title: 'Payment Failed',
        message: 'Payment could not be processed. Please check your payment details.'
      }
    };

    const defaultMessage = {
      title: 'Unexpected Error',
      message: 'Something went wrong. Please try again.'
    };

    return messages[error.type] || defaultMessage;
  }

  // Subscribe to error events
  subscribe(callback) {
    this.errorSubscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.errorSubscribers.delete(callback);
    };
  }

  // Notify all subscribers
  notifySubscribers(eventType, data) {
    this.errorSubscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Error in error handler subscriber:', error);
      }
    });
  }

  // Add error to history
  addToHistory(error) {
    this.errorHistory.unshift(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  // Generate unique error ID
  generateErrorId() {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log error with appropriate level
  logError(error) {
    const logLevel = this.getLogLevel(error.type);
    console[logLevel](`[ErrorHandler] ${error.type}:`, error);
  }

  // Get retry options for error type
  getRetryOptions(error, context) {
    const defaultOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };

    const typeSpecificOptions = {
      [ERROR_TYPES.NETWORK_ERROR]: {
        maxRetries: 5,
        baseDelay: 2000
      },
      [ERROR_TYPES.TIMEOUT_ERROR]: {
        maxRetries: 3,
        baseDelay: 1500
      },
      [ERROR_TYPES.RATE_LIMIT_ERROR]: {
        maxRetries: 3,
        baseDelay: 5000
      }
    };

    return {
      ...defaultOptions,
      ...typeSpecificOptions[error.type],
      ...context.retryOptions
    };
  }

  // Get appropriate log level for error type
  getLogLevel(errorType) {
    const logLevels = {
      [ERROR_TYPES.NETWORK_ERROR]: 'warn',
      [ERROR_TYPES.TIMEOUT_ERROR]: 'warn',
      [ERROR_TYPES.AUTHENTICATION_ERROR]: 'info',
      [ERROR_TYPES.AUTHORIZATION_ERROR]: 'warn',
      [ERROR_TYPES.VALIDATION_ERROR]: 'info',
      [ERROR_TYPES.NOT_FOUND_ERROR]: 'info',
      [ERROR_TYPES.CONFLICT_ERROR]: 'warn',
      [ERROR_TYPES.RATE_LIMIT_ERROR]: 'warn',
      [ERROR_TYPES.SERVICE_UNAVAILABLE]: 'error',
      [ERROR_TYPES.BOOKING_CONFLICT]: 'info',
      [ERROR_TYPES.PAYMENT_ERROR]: 'error'
    };

    return logLevels[errorType] || 'error';
  }
}

// Export the ErrorHandler class
export { ErrorHandler };

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;

// Export convenience functions for easy use in components
export async function handleNetworkError(networkError, context = {}) {
  return errorHandler.handleError({
    type: ERROR_TYPES.NETWORK_ERROR,
    message: 'Network request failed',
    originalError: networkError
  }, context);
}

export function subscribeToErrors(callback) {
  return errorHandler.subscribe(callback);
}

// Export error types for convenience
export { ERROR_TYPES };
