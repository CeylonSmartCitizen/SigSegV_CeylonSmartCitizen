import axios from 'axios';

export async function apiRequestWithRetry(config, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}

export function handleNetworkError(error, onRetry) {
  if (!error.response) {
    return (
      <div className="network-error">
        <p>Network error occurred. Please check your connection.</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }
  return null;
}

export function handleBookingConflict(conflictInfo, onResolve) {
  return (
    <div className="booking-conflict">
      <p>Booking conflict detected: {conflictInfo.reason}</p>
      <button onClick={onResolve}>Resolve Conflict</button>
    </div>
  );
}
