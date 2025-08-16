class TokenManager {
  constructor() {
    this.AUTH_TOKEN_KEY = 'ceylon_auth_token';
    this.REFRESH_TOKEN_KEY = 'ceylon_refresh_token';
    this.TOKEN_EXPIRY_KEY = 'ceylon_token_expiry';
    this.USER_DATA_KEY = 'ceylon_user_data';
    
    // Check token validity on initialization
    this.validateStoredToken();
  }

  // Store authentication tokens
  setTokens(authToken, refreshToken, expiresIn) {
    try {
      localStorage.setItem(this.AUTH_TOKEN_KEY, authToken);
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
      
      // Calculate expiry time (expiresIn is in seconds)
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
      
      // Dispatch custom event for token update
      this.dispatchTokenEvent('tokenUpdated', { authToken, refreshToken });
      
    } catch (error) {
      console.error('Failed to store authentication tokens:', error);
    }
  }

  // Get current auth token
  getAuthToken() {
    try {
      const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearTokens();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  // Get refresh token
  getRefreshToken() {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  // Check if current token is expired
  isTokenExpired() {
    try {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!expiryTime) {
        return false; // Assume valid if no expiry set
      }
      
      return Date.now() >= parseInt(expiryTime);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    return !!token && !this.isTokenExpired();
  }

  // Clear all authentication data
  clearTokens() {
    try {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
      
      // Dispatch logout event
      this.dispatchTokenEvent('tokenCleared');
      
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Store user data
  setUserData(userData) {
    try {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  // Get user data
  getUserData() {
    try {
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  // Validate stored token on app start
  validateStoredToken() {
    if (this.isTokenExpired()) {
      console.warn('Stored token is expired, clearing authentication data');
      this.clearTokens();
    }
  }

  // Get token with automatic refresh
  async getValidToken(apiClient) {
    let token = this.getAuthToken();
    
    if (!token) {
      return null;
    }
    
    // If token is about to expire (within 5 minutes), try to refresh
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiryTime) {
      const timeUntilExpiry = parseInt(expiryTime) - Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeUntilExpiry <= fiveMinutes) {
        try {
          await this.refreshToken(apiClient);
          token = this.getAuthToken();
        } catch (error) {
          console.warn('Token refresh failed:', error);
          this.clearTokens();
          return null;
        }
      }
    }
    
    return token;
  }

  // Refresh authentication token
  async refreshToken(apiClient) {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });
      
      const { authToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      this.setTokens(authToken, newRefreshToken, expiresIn);
      
      return authToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Dispatch custom events for token changes
  dispatchTokenEvent(eventType, data = null) {
    const event = new CustomEvent(`auth${eventType}`, {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // Listen for token events
  onTokenEvent(eventType, callback) {
    window.addEventListener(`auth${eventType}`, callback);
    
    // Return cleanup function
    return () => {
      window.removeEventListener(`auth${eventType}`, callback);
    };
  }

  // Parse JWT token payload (for debugging/info purposes)
  parseTokenPayload(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return null;
    }
  }

  // Get token info for debugging
  getTokenInfo() {
    const token = this.getAuthToken();
    
    if (!token) {
      return { authenticated: false };
    }
    
    const payload = this.parseTokenPayload(token);
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    return {
      authenticated: true,
      isExpired: this.isTokenExpired(),
      expiryTime: expiryTime ? new Date(parseInt(expiryTime)) : null,
      payload,
      hasRefreshToken: !!this.getRefreshToken()
    };
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
