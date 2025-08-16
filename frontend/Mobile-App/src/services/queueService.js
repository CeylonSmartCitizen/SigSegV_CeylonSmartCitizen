import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const getQueueStatus = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.QUEUE.STATUS);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch queue status');
  }
};

export const joinQueue = async (appointmentId) => {
  try {
    const response = await api.post(API_ENDPOINTS.QUEUE.JOIN, {
      appointmentId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to join queue');
  }
};

export const leaveQueue = async () => {
  try {
    const response = await api.post(API_ENDPOINTS.QUEUE.LEAVE);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to leave queue');
  }
};

export const getQueuePosition = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.QUEUE.POSITION);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch queue position');
  }
};
