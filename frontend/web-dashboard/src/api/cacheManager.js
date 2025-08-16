import { API_CONFIG } from './config.js';

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheDuration = API_CONFIG.CACHE_DURATION;
    this.maxCacheSize = 100; // Maximum number of cached items
    
    // Initialize from localStorage
    this.loadCacheFromStorage();
    
    // Cleanup expired cache periodically
    this.startCleanupInterval();
  }

  // Generate cache key from URL and params
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Set cache entry
  set(key, data, customDuration = null) {
    try {
      const duration = customDuration || this.cacheDuration;
      const timestamp = Date.now();
      
      // Remove oldest entries if cache is full
      if (this.cache.size >= this.maxCacheSize) {
        this.removeOldestEntries(10);
      }
      
      this.cache.set(key, {
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        timestamp,
        duration
      });
      
      this.cacheTimestamps.set(key, timestamp);
      
      // Save to localStorage
      this.saveCacheToStorage(key, data, timestamp, duration);
      
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  // Get cache entry
  get(key) {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }
      
      // Check if expired
      if (this.isExpired(key)) {
        this.delete(key);
        return null;
      }
      
      // Update access time
      this.cacheTimestamps.set(key, Date.now());
      
      return JSON.parse(JSON.stringify(entry.data)); // Deep clone
      
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  // Check if cache entry is expired
  isExpired(key) {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > entry.duration;
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    this.removeCacheFromStorage(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.clearStorageCache();
  }

  // Remove oldest entries
  removeOldestEntries(count) {
    const entries = Array.from(this.cacheTimestamps.entries())
      .sort(([,a], [,b]) => a - b)
      .slice(0, count);
    
    entries.forEach(([key]) => {
      this.delete(key);
    });
  }

  // Start cleanup interval
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Check every minute
  }

  // Remove expired entries
  cleanupExpiredEntries() {
    const expiredKeys = [];
    
    for (const [key] of this.cache.entries()) {
      if (this.isExpired(key)) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
  }

  // Save cache to localStorage
  saveCacheToStorage(key, data, timestamp, duration) {
    try {
      const storageKey = `cache_${key}`;
      const cacheEntry = {
        data,
        timestamp,
        duration
      };
      
      localStorage.setItem(storageKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  // Load cache from localStorage
  loadCacheFromStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('cache_')) {
          const cacheKey = key.replace('cache_', '');
          const cacheData = localStorage.getItem(key);
          
          if (cacheData) {
            const entry = JSON.parse(cacheData);
            
            // Check if still valid
            if (Date.now() - entry.timestamp <= entry.duration) {
              this.cache.set(cacheKey, entry);
              this.cacheTimestamps.set(cacheKey, entry.timestamp);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  // Remove cache from localStorage
  removeCacheFromStorage(key) {
    try {
      const storageKey = `cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error);
    }
  }

  // Clear all cache from localStorage
  clearStorageCache() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear storage cache:', error);
    }
  }

  // Get cache statistics
  getStats() {
    const totalEntries = this.cache.size;
    const expiredEntries = Array.from(this.cache.keys())
      .filter(key => this.isExpired(key)).length;
    
    return {
      totalEntries,
      validEntries: totalEntries - expiredEntries,
      expiredEntries,
      maxSize: this.maxCacheSize,
      usagePercentage: Math.round((totalEntries / this.maxCacheSize) * 100)
    };
  }

  // Force refresh cache for a key
  invalidate(key) {
    this.delete(key);
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => regex.test(key));
    
    keysToDelete.forEach(key => this.delete(key));
  }
}

// Export the CacheManager class
export { CacheManager };

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
