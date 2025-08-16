import { ERROR_TYPES } from './config.js';

class ErrorHandler {
  constructor() {
    this.errorSubscribers = new Set();
    this.retryAttempts = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
    
    // Setup global error handlers
    this.setupG// Network error handler - returns error information for React components to handle
export function handleNetworkError(error, onRetry) {
  return {
    type: 'network',
    message: 'Network error occurred. Please check your connection.',
    onRetry,
    error
  };
}

// Booking conflict handler - returns conflict information for React components to handle
export function handleBookingConflict(conflictInfo, onResolve) {
  return {
    type: 'booking_conflict',
    message: `Booking conflict detected: ${conflictInfo.reason}`,
    conflictInfo,
    onResolve
  };
}}

  // Setup global error handlers
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        originalError: event.reason,
        context: 'unhandled_rejection'
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: event.message || 'An unexpected error occurred',
        originalError: event.error,
        context: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  // Handle errors with automatic retry logic
  async handleError(error, context = {}) {
    const errorId = this.generateErrorId();
    const enhancedError = {
      id: errorId,
      timestamp: Date.now(),
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to error history
    this.addToHistory(enhancedError);

    // Determine if error is retryable
    const isRetryable = this.isRetryableError(error);
    const retryOptions = isRetryable ? this.getRetryOptions(error, context) : null;

    // Create user-friendly error message
    const userMessage = this.getUserFriendlyMessage(error);

    // Notify subscribers
    this.notifySubscribers('error', {
      error: enhancedError,
      userMessage,
      isRetryable,
      retryOptions
    });

    // Log error for debugging
    this.logError(enhancedError);

    return {
      errorId,
      userMessage,
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
        message: 'Please check your internet connection and try again.',
        icon: '🌐'
      },
      [ERROR_TYPES.TIMEOUT_ERROR]: {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        icon: '⏱️'
      },
      [ERROR_TYPES.AUTHENTICATION_ERROR]: {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        icon: '🔐'
      },
      [ERROR_TYPES.VALIDATION_ERROR]: {
        title: 'Invalid Information',
        message: 'Please check your input and try again.',
        icon: '⚠️'
      },
      [ERROR_TYPES.BOOKING_CONFLICT]: {
        title: 'Booking Conflict',
        message: 'The selected time is no longer available.',
        icon: '📅'
      },
      [ERROR_TYPES.SERVICE_UNAVAILABLE]: {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        icon: '🚫'
      },
      [ERROR_TYPES.UNKNOWN_ERROR]: {
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
        icon: '❌'
      }
    };

    const errorInfo = messages[error.type] || messages[ERROR_TYPES.UNKNOWN_ERROR];

    return {
      ...errorInfo,
      details: error.message,
      timestamp: new Date().toLocaleString()
    };
  }

  // Retry operation with error handling
  async retryOperation(operationId, operation, context = {}) {
    const currentAttempts = this.retryAttempts.get(operationId) || 0;
    const maxAttempts = context.maxRetries || 3;

    if (currentAttempts >= maxAttempts) {
      throw new Error(`Maximum retry attempts (${maxAttempts}) exceeded for operation: ${operationId}`);
    }

    try {
      // Increment retry count
      this.retryAttempts.set(operationId, currentAttempts + 1);

      // Wait before retry (except for first attempt)
      if (currentAttempts > 0) {
        const delay = 1000 * Math.pow(2, currentAttempts - 1); // Exponential backoff
        await this.delay(delay);

        // Notify about retry attempt
        this.notifySubscribers('retryAttempt', {
          operationId,
          attempt: currentAttempts + 1,
          maxAttempts,
          delay
        });
      }

      // Execute operation
      const result = await operation();

      // Clear retry count on success
      this.retryAttempts.delete(operationId);

      return result;

    } catch (error) {
      // If we can still retry, throw retry error
      if (currentAttempts + 1 < maxAttempts) {
        throw new Error(`Retry attempt ${currentAttempts + 1} failed, will retry again`);
      }

      // Clear retry count and throw final error
      this.retryAttempts.delete(operationId);
      throw error;
    }
  }

  // Add error to history
  addToHistory(error) {
    this.errorHistory.unshift(error);
    
    // Limit history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  // Subscribe to error events
  subscribe(callback) {
    this.errorSubscribers.add(callback);
    
    return () => {
      this.errorSubscribers.delete(callback);
    };
  }

  // Notify subscribers
  notifySubscribers(eventType, data) {
    this.errorSubscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Error subscriber failed:', error);
      }
    });
  }

  // Generate unique error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log error for debugging
  logError(error) {
    console.error(`[${error.type}] ${error.message}`, error);
  }

  // Get retry options for error
  getRetryOptions(error, context) {
    const operation = context.operation || 'operation';
    const currentAttempts = this.retryAttempts.get(context.operationId) || 0;
    const maxAttempts = context.maxRetries || 3;

    if (currentAttempts >= maxAttempts) {
      return null;
    }

    const nextDelay = 1000 * Math.pow(2, currentAttempts);

    return {
      canRetry: true,
      currentAttempts,
      maxAttempts,
      nextDelay,
      retryMessage: `Retry ${operation} (${currentAttempts + 1}/${maxAttempts})`
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;

// Legacy export for compatibility
export async function apiRequestWithRetry(config, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { apiClient } = await import('./index.js');
      const response = await apiClient.request(config);
      return response.data;
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}
