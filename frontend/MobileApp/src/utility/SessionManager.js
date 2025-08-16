// SessionManager.js - Handles persistent login sessions and token validation
import { getToken, removeToken } from './secureStorage';
import apiClient from './axiosConfig';

// Check if token exists and is valid (simple JWT exp check)
export async function isLoggedIn() {
  const token = await getToken();
  if (!token) return false;
  // Optionally decode JWT and check exp
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      await removeToken();
      return false;
    }
    return true;
  } catch (e) {
    await removeToken();
    return false;
  }
}

// Restore user session (fetch profile, preferences, etc.)
export async function restoreSession(dispatch, fetchProfile) {
  if (await isLoggedIn()) {
    try {
      await dispatch(fetchProfile());
      // Optionally fetch preferences, etc.
    } catch (e) {
      // Handle error (e.g., force logout)
      await removeToken();
    }
  }
}

// If you want to support refresh tokens, implement and uncomment below when backend is ready.
import { getRefreshToken, saveToken, saveRefreshToken } from './secureStorage';
export async function refreshSession() {
const refreshToken = await getRefreshToken();
if (!refreshToken) return false;
   try {
    const res = await apiClient.post('/refresh-token', { refreshToken });
     await saveToken(res.data.token);
      await saveRefreshToken(res.data.refreshToken);
     return true;
   } catch (e) {
     await removeToken();
      await removeRefreshToken();
     return false;
   }
 }
