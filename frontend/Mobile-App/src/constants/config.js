export const API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    PREFERENCES: '/user/preferences',
  },
  SERVICES: {
    LIST: '/services',
    CATEGORIES: '/services/categories',
    DETAILS: '/services',
    SEARCH: '/services/search',
  },
  APPOINTMENTS: {
    CREATE: '/appointments',
    LIST: '/appointments',
    CANCEL: '/appointments',
    RESCHEDULE: '/appointments',
    AVAILABLE_SLOTS: '/appointments/available-slots',
  },
  QUEUE: {
    STATUS: '/queue/status',
    JOIN: '/queue/join',
    LEAVE: '/queue/leave',
    POSITION: '/queue/position',
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    LIST: '/documents',
    DELETE: '/documents',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/read',
    PREFERENCES: '/notifications/preferences',
  },
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'selected_language',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  REMEMBER_ME: 'remember_me',
};

export const QUEUE_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];
