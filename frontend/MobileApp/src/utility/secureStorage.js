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
