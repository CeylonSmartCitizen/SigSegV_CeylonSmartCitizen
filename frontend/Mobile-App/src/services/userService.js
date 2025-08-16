import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const getUserProfile = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const uploadAvatar = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    const response = await api.post(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload avatar');
  }
};

export const updateLanguagePreference = async (language) => {
  try {
    const response = await api.put(API_ENDPOINTS.USER.PREFERENCES, {
      language,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update language preference');
  }
};

export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put(API_ENDPOINTS.USER.PREFERENCES, {
      notifications: preferences,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
  }
};
