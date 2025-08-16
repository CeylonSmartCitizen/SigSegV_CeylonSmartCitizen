import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth Service API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
  getPreferences: () => api.get('/auth/preferences'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  saveLanguage: (language) => api.put('/auth/language', { language })
}

// Appointment Service API calls
export const appointmentAPI = {
  getAppointments: (params) => api.get('/appointments', { params }),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  getServices: () => api.get('/appointments/services'),
  getServiceById: (id) => api.get(`/appointments/services/${id}`),
  getDepartments: () => api.get('/appointments/departments'),
  getOfficers: (departmentId) => api.get(`/appointments/officers?department=${departmentId}`),
  getAvailableSlots: (serviceId, date) => api.get(`/appointments/slots?service=${serviceId}&date=${date}`)
}

// Support Services API calls
export const supportAPI = {
  // Document services
  uploadDocument: (formData) => api.post('/support/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: (params) => api.get('/support/documents', { params }),
  deleteDocument: (id) => api.delete(`/support/documents/${id}`),
  downloadDocument: (id) => api.get(`/support/documents/${id}/download`, { responseType: 'blob' }),
  
  // Notification services
  getNotifications: (params) => api.get('/support/notifications', { params }),
  markNotificationRead: (id) => api.put(`/support/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/support/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/support/notifications/${id}`),
  getNotificationSettings: () => api.get('/support/notifications/settings'),
  updateNotificationSettings: (data) => api.put('/support/notifications/settings', data),
  
  // Queue services
  getQueues: () => api.get('/support/queues'),
  getQueueById: (id) => api.get(`/support/queues/${id}`),
  joinQueue: (queueId, data) => api.post(`/support/queues/${queueId}/join`, data),
  leaveQueue: (queueId) => api.post(`/support/queues/${queueId}/leave`),
  getQueuePosition: (queueId) => api.get(`/support/queues/${queueId}/position`),
  getQueueStatus: (queueId) => api.get(`/support/queues/${queueId}/status`),
  
  // Officer services
  getOfficers: (params) => api.get('/support/officers', { params }),
  getOfficerById: (id) => api.get(`/support/officers/${id}`),
  
  // Audit services
  getAuditLogs: (params) => api.get('/support/audit', { params }),
  getSystemStats: () => api.get('/support/audit/stats')
}

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  checkAuthHealth: () => api.get('/auth/health')
}

export { api }
export default api
