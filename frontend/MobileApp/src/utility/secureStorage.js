// Utility for secure storage of sensitive data (e.g., tokens)
// Uses expo-secure-store if available, otherwise falls back to AsyncStorage

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isSecureStoreAvailable = !!SecureStore && typeof SecureStore.setItemAsync === 'function';

export const saveItem = async (key, value) => {
  if (isSecureStoreAvailable) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

export const getItem = async (key) => {
  if (isSecureStoreAvailable) {
    return await SecureStore.getItemAsync(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

export const deleteItem = async (key) => {
  if (isSecureStoreAvailable) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

// JWT token helpers
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const saveToken = async (token) => {
  return saveItem(TOKEN_KEY, token);
};
export const getToken = async () => {
  return getItem(TOKEN_KEY);
};
export const removeToken = async () => {
  return deleteItem(TOKEN_KEY);
};

// Uncomment and use when backend supports refresh tokens
export const saveRefreshToken = async (refreshToken) => saveItem(REFRESH_TOKEN_KEY, refreshToken);
export const getRefreshToken = async () => getItem(REFRESH_TOKEN_KEY);
export const removeRefreshToken = async () => deleteItem(REFRESH_TOKEN_KEY);
