import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const getNotifications = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
  }
};
