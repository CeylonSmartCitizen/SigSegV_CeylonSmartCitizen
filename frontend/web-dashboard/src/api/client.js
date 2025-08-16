import { API_CONFIG, HTTP_STATUS, ERROR_TYPES } from './config.js';

class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    
    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  setupDefaultInterceptors() {
    // Request interceptor for auth token
    this.addRequestInterceptor((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      
      // Add default headers
      config.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      };
      
      return config;
    });

    // Response interceptor for error handling
    this.addResponseInterceptor(
      (response) => response,
      async (error) => {
        if (error.status === HTTP_STATUS.UNAUTHORIZED) {
          await this.handleUnauthorizedError();
        }
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(successHandler, errorHandler) {
    this.responseInterceptors.push({ successHandler, errorHandler });
  }

  async request(config) {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    const url = `${this.baseURL}${finalConfig.url}`;
    const requestConfig = {
      method: finalConfig.method || 'GET',
      headers: finalConfig.headers || {},
      signal: this.createAbortSignal(),
      ...finalConfig
    };

    if (finalConfig.data) {
      requestConfig.body = JSON.stringify(finalConfig.data);
    }

    try {
      const response = await this.fetchWithRetry(url, requestConfig);
      let processedResponse = {
        data: await this.parseResponse(response),
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };

      // Apply response interceptors
      for (const { successHandler } of this.responseInterceptors) {
        if (successHandler) {
          processedResponse = await successHandler(processedResponse);
        }
      }

      return processedResponse;
    } catch (error) {
      // Apply error interceptors
      let processedError = error;
      for (const { errorHandler } of this.responseInterceptors) {
        if (errorHandler) {
          try {
            processedError = await errorHandler(processedError);
          } catch (interceptorError) {
            processedError = interceptorError;
          }
        }
      }
      throw processedError;
    }
  }

  async fetchWithRetry(url, config, attempt = 1) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          response
        };
      }
      
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.status || 
           error.status >= 500 || 
           error.name === 'TypeError' ||
           error.name === 'AbortError';
  }

  createAbortSignal() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller.signal;
  }

  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  normalizeError(error) {
    if (error.name === 'AbortError') {
      return {
        type: ERROR_TYPES.TIMEOUT_ERROR,
        message: 'Request timeout',
        status: null,
        originalError: error
      };
    }

    if (!error.status) {
      return {
        type: ERROR_TYPES.NETWORK_ERROR,
        message: 'Network connection failed',
        status: null,
        originalError: error
      };
    }

    const errorType = this.getErrorType(error.status);
    
    return {
      type: errorType,
      message: this.getErrorMessage(error.status, errorType),
      status: error.status,
      statusText: error.statusText,
      originalError: error
    };
  }

  getErrorType(status) {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_TYPES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_TYPES.AUTHENTICATION_ERROR;
      case HTTP_STATUS.CONFLICT:
        return ERROR_TYPES.BOOKING_CONFLICT;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_TYPES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_TYPES.UNKNOWN_ERROR;
    }
  }

  getErrorMessage(status, type) {
    const messages = {
      [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again',
      [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Authentication required. Please log in',
      [ERROR_TYPES.BOOKING_CONFLICT]: 'This time slot is no longer available',
      [ERROR_TYPES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
      [ERROR_TYPES.NETWORK_ERROR]: 'Network connection failed',
      [ERROR_TYPES.TIMEOUT_ERROR]: 'Request timed out',
      [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred'
    };

    return messages[type] || 'An error occurred';
  }

  async handleUnauthorizedError() {
    // Try to refresh token
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.refreshAuthToken(refreshToken);
        return;
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
    }

    // Clear auth and redirect to login
    this.clearAuthTokens();
    window.location.href = '/login';
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setAuthTokens(authToken, refreshToken) {
    localStorage.setItem('authToken', authToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearAuthTokens() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  async refreshAuthToken(refreshToken) {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setAuthTokens(data.authToken, data.refreshToken);
    return data;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;
