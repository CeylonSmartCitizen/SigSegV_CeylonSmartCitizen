import axios from 'axios';

// Simple cache for service directory
let serviceCache = null;

export async function fetchServiceDirectory() {
  if (serviceCache) return serviceCache;
  try {
    const response = await axios.get('/api/services');
    serviceCache = response.data;
    return serviceCache;
  } catch (error) {
    throw error;
  }
}

export function clearServiceCache() {
  serviceCache = null;
}
