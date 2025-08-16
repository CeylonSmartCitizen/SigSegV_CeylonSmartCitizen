import apiClient from './client.js';
import tokenManager from './tokenManager.js';
import { API_ENDPOINTS } from './config.js';

// Replace URL parameters with actual values
const replaceUrlParams = (url, params) => {
  let finalUrl = url;
  Object.keys(params).forEach(key => {
    finalUrl = finalUrl.replace(`:${key}`, params[key]);
  });
  return finalUrl;
};

// Authentication API
export const authAPI = {
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.data.authToken) {
      tokenManager.setTokens(
        response.data.authToken,
        response.data.refreshToken,
        response.data.expiresIn
      );
      
      if (response.data.user) {
        tokenManager.setUserData(response.data.user);
      }
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  async refreshToken() {
    return await tokenManager.refreshToken(apiClient);
  },

  async verifyToken() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
    return response.data;
  },

  getCurrentUser() {
    return tokenManager.getUserData();
  },

  isAuthenticated() {
    return tokenManager.isAuthenticated();
  }
};

// Services API
export const servicesAPI = {
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.SERVICES.LIST}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async getServiceDetails(serviceId) {
    const url = replaceUrlParams(API_ENDPOINTS.SERVICES.DETAILS, { id: serviceId });
    const response = await apiClient.get(url);
    return response.data;
  },

  async searchServices(query, filters = {}) {
    const params = { query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.SERVICES.SEARCH}?${queryString}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async getServiceCategories() {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CATEGORIES);
    return response.data;
  },

  async checkAvailability(serviceId, params = {}) {
    const url = replaceUrlParams(API_ENDPOINTS.SERVICES.AVAILABILITY, { id: serviceId });
    const queryString = new URLSearchParams(params).toString();
    const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(finalUrl);
    return response.data;
  }
};

// Bookings API
export const bookingsAPI = {
  async createBooking(bookingData) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
    return response.data;
  },

  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.BOOKINGS.LIST}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async getBookingDetails(bookingId) {
    const url = replaceUrlParams(API_ENDPOINTS.BOOKINGS.DETAILS, { id: bookingId });
    const response = await apiClient.get(url);
    return response.data;
  },

  async updateBooking(bookingId, updateData) {
    const url = replaceUrlParams(API_ENDPOINTS.BOOKINGS.UPDATE, { id: bookingId });
    const response = await apiClient.put(url, updateData);
    return response.data;
  },

  async cancelBooking(bookingId, reason = '') {
    const url = replaceUrlParams(API_ENDPOINTS.BOOKINGS.CANCEL, { id: bookingId });
    const response = await apiClient.post(url, { reason });
    return response.data;
  },

  async validateBooking(bookingData) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.VALIDATE, bookingData);
    return response.data;
  },

  async checkBookingConflicts(bookingData) {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CONFLICTS, bookingData);
    return response.data;
  }
};

// User API
export const userAPI = {
  async getProfile() {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.put(API_ENDPOINTS.USER.PROFILE, profileData);
    return response.data;
  },

  async getUserAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.USER.APPOINTMENTS}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.USER.NOTIFICATIONS}${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async getUserPreferences() {
    const response = await apiClient.get(API_ENDPOINTS.USER.PREFERENCES);
    return response.data;
  },

  async updateUserPreferences(preferences) {
    const response = await apiClient.put(API_ENDPOINTS.USER.PREFERENCES, preferences);
    return response.data;
  }
};

// Import and export main API classes
import { ServiceDataManager } from './serviceDataManager.js';
import { DataSyncManager } from './dataSyncManager.js';
import { CacheManager } from './cacheManager.js';
import { BookingManager } from './booking.jsx';
import errorHandler, { ErrorHandler } from './errorHandling.js';

// Export all APIs
export {
  apiClient,
  tokenManager,
  ServiceDataManager,
  DataSyncManager,
  CacheManager,
  BookingManager,
  ErrorHandler,
  errorHandler
};
