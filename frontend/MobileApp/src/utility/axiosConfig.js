// axiosConfig.js - Axios instance with interceptors for auth, refresh, and error handling
import axios from 'axios';
import secureStorage from './secureStorage';

const API_BASE_URL = 'http://<YOUR_BACKEND_URL>/api/auth'; // Set your backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle auth errors, refresh token, redirects
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If token expired, try to refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Uncomment and implement refresh logic when backend is ready
        // const refreshToken = await secureStorage.getRefreshToken();
        // const res = await axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });
        // await secureStorage.saveToken(res.data.token);
        // originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        // return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login or handle logout
        // e.g., store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
