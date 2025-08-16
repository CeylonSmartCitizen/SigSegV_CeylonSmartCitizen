import { bookingsAPI, userAPI } from './index.js';

class DataSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncSubscribers = new Set();
    this.conflictResolvers = new Map();
    
    // Listen for online/offline events
    this.setupNetworkListeners();
    
    // Initialize sync when online
    if (this.isOnline) {
      this.startPeriodicSync();
    }
  }

  // Setup network event listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
      this.processSyncQueue();
      this.startPeriodicSync();
      this.notifySubscribers('networkStatusChanged', { online: true });
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.isOnline = false;
      this.stopPeriodicSync();
      this.notifySubscribers('networkStatusChanged', { online: false });
    });
  }

  // Add item to sync queue
  addToSyncQueue(item) {
    const syncItem = {
      id: this.generateSyncId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      ...item
    };
    
    this.syncQueue.push(syncItem);
    
    // Save queue to localStorage
    this.saveSyncQueue();
    
    // Process immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
    
    return syncItem.id;
  }

  // Generate unique sync ID
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Process sync queue
  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifySubscribers('syncStarted', { queueLength: this.syncQueue.length });

    const processed = [];
    const failed = [];

    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item);
        processed.push(item);
        
        this.notifySubscribers('syncItemCompleted', { 
          item, 
          success: true 
        });
        
      } catch (error) {
        console.error('Sync item failed:', error);
        
        item.retryCount++;
        item.lastError = error.message;
        
        if (item.retryCount >= item.maxRetries) {
          failed.push(item);
          this.notifySubscribers('syncItemFailed', { 
            item, 
            error: error.message 
          });
        } else {
          // Keep in queue for retry
          this.notifySubscribers('syncItemRetry', { 
            item, 
            attempt: item.retryCount 
          });
        }
      }
    }

    // Remove processed items from queue
    this.syncQueue = this.syncQueue.filter(item => 
      !processed.includes(item) && !failed.includes(item)
    );

    // Save updated queue
    this.saveSyncQueue();

    this.syncInProgress = false;
    
    this.notifySubscribers('syncCompleted', {
      processed: processed.length,
      failed: failed.length,
      remaining: this.syncQueue.length
    });
  }

  // Process individual sync item
  async processSyncItem(item) {
    switch (item.type) {
      case 'appointment_create':
        return await this.syncAppointmentCreate(item.data);
      
      case 'appointment_update':
        return await this.syncAppointmentUpdate(item.data);
      
      case 'appointment_cancel':
        return await this.syncAppointmentCancel(item.data);
      
      case 'user_profile_update':
        return await this.syncUserProfileUpdate(item.data);
      
      case 'preferences_update':
        return await this.syncPreferencesUpdate(item.data);
      
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  // Sync appointment creation
  async syncAppointmentCreate(data) {
    try {
      const result = await bookingsAPI.createBooking(data.bookingData);
      
      // Update local storage with server response
      this.updateLocalAppointment(data.localId, result);
      
      return result;
      
    } catch (error) {
      if (error.type === 'BOOKING_CONFLICT') {
        await this.handleBookingConflict(data, error);
      }
      throw error;
    }
  }

  // Sync appointment update
  async syncAppointmentUpdate(data) {
    const result = await bookingsAPI.updateBooking(data.appointmentId, data.updateData);
    
    // Update local storage
    this.updateLocalAppointment(data.appointmentId, result);
    
    return result;
  }

  // Sync appointment cancellation
  async syncAppointmentCancel(data) {
    const result = await bookingsAPI.cancelBooking(data.appointmentId, data.reason);
    
    // Update local storage
    this.updateLocalAppointment(data.appointmentId, result);
    
    return result;
  }

  // Sync user profile update
  async syncUserProfileUpdate(data) {
    const result = await userAPI.updateProfile(data.profileData);
    
    // Update local storage
    this.updateLocalUserData(result);
    
    return result;
  }

  // Sync preferences update
  async syncPreferencesUpdate(data) {
    const result = await userAPI.updateUserPreferences(data.preferences);
    
    // Update local storage
    this.updateLocalPreferences(result);
    
    return result;
  }

  // Handle booking conflicts
  async handleBookingConflict(originalData, conflictError) {
    const resolver = this.conflictResolvers.get('booking_conflict');
    
    if (resolver) {
      try {
        const resolution = await resolver(originalData, conflictError);
        
        if (resolution.action === 'retry_with_new_time') {
          // Add new sync item with updated time
          this.addToSyncQueue({
            type: 'appointment_create',
            data: {
              ...originalData,
              bookingData: {
                ...originalData.bookingData,
                dateTime: resolution.newDateTime
              }
            }
          });
        } else if (resolution.action === 'cancel') {
          // User chose to cancel the booking
          this.notifySubscribers('bookingCancelled', { 
            localId: originalData.localId,
            reason: 'conflict_resolution'
          });
        }
        
      } catch (error) {
        console.error('Conflict resolution failed:', error);
      }
    }
    
    // Notify about the conflict
    this.notifySubscribers('bookingConflict', {
      originalData,
      conflictError,
      timestamp: Date.now()
    });
  }

  // Update local appointment data
  updateLocalAppointment(localId, serverData) {
    try {
      const appointments = this.getLocalAppointments();
      const index = appointments.findIndex(apt => 
        apt.id === localId || apt.localId === localId
      );
      
      if (index !== -1) {
        appointments[index] = {
          ...appointments[index],
          ...serverData,
          synced: true,
          lastSyncTime: Date.now()
        };
      } else {
        appointments.push({
          ...serverData,
          synced: true,
          lastSyncTime: Date.now()
        });
      }
      
      localStorage.setItem('local_appointments', JSON.stringify(appointments));
      
      this.notifySubscribers('localAppointmentUpdated', { 
        localId, 
        serverData 
      });
      
    } catch (error) {
      console.error('Failed to update local appointment:', error);
    }
  }

  // Update local user data
  updateLocalUserData(userData) {
    try {
      localStorage.setItem('local_user_data', JSON.stringify({
        ...userData,
        lastSyncTime: Date.now()
      }));
      
      this.notifySubscribers('localUserDataUpdated', userData);
      
    } catch (error) {
      console.error('Failed to update local user data:', error);
    }
  }

  // Update local preferences
  updateLocalPreferences(preferences) {
    try {
      localStorage.setItem('local_preferences', JSON.stringify({
        ...preferences,
        lastSyncTime: Date.now()
      }));
      
      this.notifySubscribers('localPreferencesUpdated', preferences);
      
    } catch (error) {
      console.error('Failed to update local preferences:', error);
    }
  }

  // Get local appointments
  getLocalAppointments() {
    try {
      const appointments = localStorage.getItem('local_appointments');
      return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
      console.error('Failed to get local appointments:', error);
      return [];
    }
  }

  // Save sync queue to localStorage
  saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load sync queue from localStorage
  loadSyncQueue() {
    try {
      const queue = localStorage.getItem('sync_queue');
      if (queue) {
        this.syncQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Start periodic sync
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // Every 30 seconds
  }

  // Stop periodic sync
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Subscribe to sync events
  subscribe(callback) {
    this.syncSubscribers.add(callback);
    
    return () => {
      this.syncSubscribers.delete(callback);
    };
  }

  // Notify subscribers
  notifySubscribers(eventType, data) {
    this.syncSubscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Sync subscriber error:', error);
      }
    });
  }

  // Register conflict resolver
  registerConflictResolver(conflictType, resolver) {
    this.conflictResolvers.set(conflictType, resolver);
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      pendingItems: this.syncQueue.map(item => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp,
        retryCount: item.retryCount,
        lastError: item.lastError
      }))
    };
  }

  // Force sync now
  async forceSyncNow() {
    if (this.isOnline) {
      await this.processSyncQueue();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  // Clear sync queue
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
    this.notifySubscribers('syncQueueCleared', {});
  }

  // Initialize on app start
  initialize() {
    this.loadSyncQueue();
    
    if (this.isOnline && this.syncQueue.length > 0) {
      // Process queue after a short delay to allow app to initialize
      setTimeout(() => {
        this.processSyncQueue();
      }, 2000);
    }
  }
}

// Create singleton instance
const dataSyncManager = new DataSyncManager();

export default dataSyncManager;
export { DataSyncManager };
