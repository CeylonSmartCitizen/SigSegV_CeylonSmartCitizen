import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const getServices = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${API_ENDPOINTS.SERVICES.LIST}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch services');
  }
};

export const getServiceCategories = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.SERVICES.CATEGORIES);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service categories');
  }
};

export const getServiceDetails = async (serviceId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.SERVICES.DETAILS}/${serviceId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service details');
  }
};

export const searchServices = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    }).toString();
    const response = await api.get(`${API_ENDPOINTS.SERVICES.SEARCH}?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Search failed');
  }
};
