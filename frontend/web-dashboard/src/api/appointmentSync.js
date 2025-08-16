import axios from 'axios';

// Handle booking conflicts and sync appointments
export async function resolveBookingConflict(bookingId) {
  try {
    const response = await axios.post(`/api/bookings/${bookingId}/resolve-conflict`);
    return response.data; // { resolved: true/false, options: [...] }
  } catch (error) {
    throw error;
  }
}

export async function syncAppointments(userId) {
  try {
    const response = await axios.get(`/api/users/${userId}/appointments`);
    return response.data; // Array of appointments
  } catch (error) {
    throw error;
  }
}
