import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';

export const login = async (email, password) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const { user, token, refreshToken } = response.data;

    // Store tokens and user data
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
    ]);

    return { user, token, refreshToken };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);

    const { user, token, refreshToken } = response.data;

    // Store tokens and user data
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
    ]);

    return { user, token, refreshToken };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    const { token, refreshToken: newRefreshToken } = response.data;

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken],
    ]);

    return { token, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Token refresh failed');
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Password reset request failed');
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Password reset failed');
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Password change failed');
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Email verification failed');
  }
};
