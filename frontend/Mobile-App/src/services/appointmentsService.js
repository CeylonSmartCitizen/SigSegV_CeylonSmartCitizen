import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const getAppointments = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.APPOINTMENTS.LIST);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post(API_ENDPOINTS.APPOINTMENTS.CREATE, appointmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create appointment');
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.APPOINTMENTS.CANCEL}/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
  }
};

export const rescheduleAppointment = async (appointmentId, newDateTime) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.APPOINTMENTS.RESCHEDULE}/${appointmentId}`, {
      dateTime: newDateTime,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reschedule appointment');
  }
};

export const getAvailableSlots = async (serviceId, date) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS}?serviceId=${serviceId}&date=${date}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available slots');
  }
};
