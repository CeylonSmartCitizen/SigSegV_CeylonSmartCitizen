import { servicesAPI } from './index.js';
import cacheManager from './cacheManager.js';

class ServiceDataManager {
  constructor() {
    this.services = new Map();
    this.categories = null;
    this.availabilityCache = new Map();
    this.subscriptions = new Map();
    this.refreshIntervals = new Map();
    
    // Initialize data
    this.initialize();
  }

  async initialize() {
    try {
      // Load cached services and categories
      await this.loadCachedData();
      
      // Start periodic refresh for critical data
      this.startPeriodicRefresh();
      
    } catch (error) {
      console.warn('Service data manager initialization failed:', error);
    }
  }

  // Load cached data on startup
  async loadCachedData() {
    try {
      // Try to load categories from cache
      const cachedCategories = cacheManager.get('service_categories');
      if (cachedCategories) {
        this.categories = cachedCategories;
      }

      // Try to load services from cache
      const cachedServices = cacheManager.get('services_list');
      if (cachedServices) {
        cachedServices.forEach(service => {
          this.services.set(service.id, service);
        });
      }

    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  }

  // Fetch service directory with caching
  async fetchServiceDirectory(params = {}, forceRefresh = false) {
    const cacheKey = cacheManager.generateKey('services_list', params);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        // Update local services map
        cachedData.forEach(service => {
          this.services.set(service.id, service);
        });
        return cachedData;
      }
    }

    try {
      // Fetch from API
      const response = await servicesAPI.getServices(params);
      const services = response.services || response;
      
      // Cache the response
      cacheManager.set(cacheKey, services);
      
      // Update local services map
      services.forEach(service => {
        this.services.set(service.id, service);
      });
      
      // Notify subscribers
      this.notifySubscribers('servicesUpdated', services);
      
      return services;
      
    } catch (error) {
      console.error('Failed to fetch service directory:', error);
      
      // Return cached data as fallback
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        return fallbackData;
      }
      
      throw error;
    }
  }

  // Get service details with caching
  async getServiceDetails(serviceId, forceRefresh = false) {
    const cacheKey = `service_details_${serviceId}`;
    
    // Return cached data if available
    if (!forceRefresh) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const serviceDetails = await servicesAPI.getServiceDetails(serviceId);
      
      // Cache the response
      cacheManager.set(cacheKey, serviceDetails);
      
      // Update local services map
      this.services.set(serviceId, serviceDetails);
      
      return serviceDetails;
      
    } catch (error) {
      console.error(`Failed to fetch service details for ${serviceId}:`, error);
      
      // Return cached data as fallback
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        return fallbackData;
      }
      
      throw error;
    }
  }

  // Get service categories with caching
  async getServiceCategories(forceRefresh = false) {
    const cacheKey = 'service_categories';
    
    // Return cached data if available
    if (!forceRefresh && this.categories) {
      return this.categories;
    }

    if (!forceRefresh) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        this.categories = cachedData;
        return cachedData;
      }
    }

    try {
      const categories = await servicesAPI.getServiceCategories();
      
      // Cache the response
      cacheManager.set(cacheKey, categories);
      this.categories = categories;
      
      return categories;
      
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
      
      // Return cached data as fallback
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        this.categories = fallbackData;
        return fallbackData;
      }
      
      throw error;
    }
  }

  // Real-time availability checking
  async checkServiceAvailability(serviceId, params = {}) {
    const cacheKey = cacheManager.generateKey(`availability_${serviceId}`, params);
    
    try {
      const availability = await servicesAPI.checkAvailability(serviceId, params);
      
      // Cache with shorter duration for availability data
      cacheManager.set(cacheKey, availability, 60000); // 1 minute cache
      
      // Update availability cache
      this.availabilityCache.set(serviceId, availability);
      
      // Notify subscribers
      this.notifySubscribers('availabilityUpdated', { serviceId, availability });
      
      return availability;
      
    } catch (error) {
      console.error(`Failed to check availability for service ${serviceId}:`, error);
      
      // Return cached data as fallback
      const fallbackData = cacheManager.get(cacheKey);
      if (fallbackData) {
        return fallbackData;
      }
      
      throw error;
    }
  }

  // Search services with caching
  async searchServices(query, filters = {}) {
    const cacheKey = cacheManager.generateKey('search_services', { query, ...filters });
    
    // Check cache first
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const searchResults = await servicesAPI.searchServices(query, filters);
      
      // Cache search results
      cacheManager.set(cacheKey, searchResults, 300000); // 5 minutes cache
      
      return searchResults;
      
    } catch (error) {
      console.error('Service search failed:', error);
      throw error;
    }
  }

  // Get local service data (cached)
  getLocalService(serviceId) {
    return this.services.get(serviceId);
  }

  // Get all local services
  getAllLocalServices() {
    return Array.from(this.services.values());
  }

  // Subscribe to data updates
  subscribe(eventType, callback) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Notify subscribers
  notifySubscribers(eventType, data) {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  // Start periodic refresh for critical data
  startPeriodicRefresh() {
    // Refresh service directory every 10 minutes
    this.refreshIntervals.set('services', setInterval(async () => {
      try {
        await this.fetchServiceDirectory({}, true);
      } catch (error) {
        console.warn('Periodic service refresh failed:', error);
      }
    }, 600000)); // 10 minutes

    // Refresh categories every hour
    this.refreshIntervals.set('categories', setInterval(async () => {
      try {
        await this.getServiceCategories(true);
      } catch (error) {
        console.warn('Periodic categories refresh failed:', error);
      }
    }, 3600000)); // 1 hour
  }

  // Stop periodic refresh
  stopPeriodicRefresh() {
    this.refreshIntervals.forEach((intervalId, key) => {
      clearInterval(intervalId);
    });
    this.refreshIntervals.clear();
  }

  // Force refresh all cached data
  async refreshAllData() {
    try {
      await Promise.all([
        this.fetchServiceDirectory({}, true),
        this.getServiceCategories(true)
      ]);
      
      this.notifySubscribers('dataRefreshed', { timestamp: Date.now() });
      
    } catch (error) {
      console.error('Failed to refresh all data:', error);
      throw error;
    }
  }

  // Invalidate specific service cache
  invalidateService(serviceId) {
    // Remove from local cache
    this.services.delete(serviceId);
    
    // Invalidate related cache entries
    cacheManager.invalidatePattern(`service_details_${serviceId}`);
    cacheManager.invalidatePattern(`availability_${serviceId}`);
    
    this.notifySubscribers('serviceInvalidated', { serviceId });
  }

  // Sync data across devices (placeholder for future implementation)
  async syncDataAcrossDevices() {
    // This would typically involve:
    // 1. Checking server timestamp for data freshness
    // 2. Uploading any local changes
    // 3. Downloading updates from server
    // 4. Resolving conflicts
    
    try {
      // For now, just refresh all data
      await this.refreshAllData();
      
      this.notifySubscribers('dataSynced', { timestamp: Date.now() });
      
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  // Get data manager statistics
  getStats() {
    return {
      localServices: this.services.size,
      categories: this.categories ? this.categories.length : 0,
      availabilityEntries: this.availabilityCache.size,
      subscriptions: Array.from(this.subscriptions.entries()).map(([type, callbacks]) => ({
        type,
        count: callbacks.size
      })),
      cache: cacheManager.getStats()
    };
  }

  // Cleanup resources
  cleanup() {
    this.stopPeriodicRefresh();
    this.subscriptions.clear();
    this.services.clear();
    this.availabilityCache.clear();
  }
}

// Create singleton instance
const serviceDataManager = new ServiceDataManager();

export default serviceDataManager;
export { ServiceDataManager };
