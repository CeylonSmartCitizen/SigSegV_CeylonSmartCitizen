// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify'
  },
  
  // Services
  SERVICES: {
    LIST: '/services',
    DETAILS: '/services/:id',
    SEARCH: '/services/search',
    CATEGORIES: '/services/categories',
    AVAILABILITY: '/services/:id/availability'
  },
  
  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAILS: '/bookings/:id',
    UPDATE: '/bookings/:id',
    CANCEL: '/bookings/:id/cancel',
    CONFLICTS: '/bookings/conflicts',
    VALIDATE: '/bookings/validate'
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    APPOINTMENTS: '/user/appointments',
    NOTIFICATIONS: '/user/notifications',
    PREFERENCES: '/user/preferences'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};
