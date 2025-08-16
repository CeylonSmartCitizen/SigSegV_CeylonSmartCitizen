import axios from 'axios';

const API_BASE = 'http://<YOUR_BACKEND_URL>/api/auth';

// Registration & Login
export const registerUser = (data) => axios.post(`${API_BASE}/register`, data);

export const loginUser = (identifier, password) => {
  // Determine if identifier is email or phone
  const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier);
  return axios.post(`${API_BASE}/login`, isEmail
    ? { email: identifier, password }
    : { phone: identifier, password }
  );
};
export const forgotPassword = (email) => axios.post(`${API_BASE}/forgot-password`, { email });
export const resetPassword = (token, password) => axios.post(`${API_BASE}/reset-password`, { token, password });

// Profile
export const getProfile = () => axios.get(`${API_BASE}/profile`);
export const updateProfile = (data) => axios.put(`${API_BASE}/profile`, data);

// Preferences
export const getPreferences = () => axios.get(`${API_BASE}/preferences`);
export const updatePreferences = (data) => axios.put(`${API_BASE}/preferences`, data);

// Password change
export const changePassword = (oldPassword, newPassword) =>
  axios.put(`${API_BASE}/change-password`, { oldPassword, newPassword });

// Logout
export const logout = () => axios.post(`${API_BASE}/logout`);
export const logoutAll = () => axios.post(`${API_BASE}/global-logout`);

// The following endpoints are not yet implemented in the backend.
// Uncomment and use them when your backend supports these features:

// // Active Sessions
// export const getActiveSessions = () => axios.get(`${API_BASE}/sessions`);
// export const logoutSession = (sessionId) => axios.post(`${API_BASE}/logout-session/${sessionId}`);
// export const logoutAllSessions = () => axios.post(`${API_BASE}/logout-all-sessions`);

// // Account Deactivation
// export const deactivateAccount = () => axios.delete(`${API_BASE}/deactivate-account`);

// // Data Export
// export const exportUserData = () => axios.get(`${API_BASE}/export-data`);

// // Two-Factor Authentication
// export const setupTwoFactor = () => axios.post(`${API_BASE}/2fa/setup`);
// export const verifyTwoFactor = (code) => axios.post(`${API_BASE}/2fa/verify`, { code });
// export const disableTwoFactor = () => axios.post(`${API_BASE}/2fa/disable`);