import axios from 'axios';

export async function checkAvailability(serviceId, date, time) {
  try {
    const response = await axios.get(`/api/services/${serviceId}/availability`, {
      params: { date, time }
    });
    return response.data; // { available: true/false, reason: '...' }
  } catch (error) {
    throw error;
  }
}

export async function submitBooking(bookingData) {
  try {
    // Basic validation
    if (!bookingData.serviceId || !bookingData.selectedDate || !bookingData.selectedTime) {
      throw new Error('Missing required booking fields');
    }
    const response = await axios.post('/api/bookings', bookingData);
    return response.data; // { success: true, bookingId, ... }
  } catch (error) {
    throw error;
  }
}
