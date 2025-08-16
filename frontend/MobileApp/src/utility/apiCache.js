// apiCache.js - Simple API response caching for offline access
// Uses AsyncStorage for persistent storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'api_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function setCache(key, data, ttl = DEFAULT_TTL) {
  const item = {
    data,
    expiry: Date.now() + ttl,
  };
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    // Handle error (optional: log or report)
  }
}

export async function getCache(key) {
  try {
    const value = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!value) return null;
    const item = JSON.parse(value);
    if (item.expiry && item.expiry > Date.now()) {
      return item.data;
    } else {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
  } catch (e) {
    // Handle error (optional: log or report)
    return null;
  }
}

export async function clearCache(key) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    // Handle error (optional: log or report)
  }
}

// If you want to sync cache with backend or support background refresh, implement and uncomment below when backend is ready.
// export async function syncCacheWithBackend(key, fetchFunction) {
//   // const data = await fetchFunction();
//   // await setCache(key, data);
//   // return data;
// }
