import serviceDataManager from './serviceDataManager.js';
import dataSyncManager from './dataSyncManager.js';
import { bookingsAPI } from './index.js';

class AppointmentSyncManager {
  constructor() {
    this.localAppointments = new Map();
    this.syncSubscribers = new Set();
    this.conflictHandlers = new Map();
    
    // Initialize
    this.initialize();
  }

  async initialize() {
    // Load local appointments
    this.loadLocalAppointments();
    
    // Setup sync manager
    dataSyncManager.initialize();
    
    // Register conflict resolvers
    this.setupConflictResolvers();
    
    // Subscribe to sync events
    this.subscribeSyncEvents();
  }

  // Load appointments from local storage
  loadLocalAppointments() {
    try {
      const appointments = localStorage.getItem('local_appointments');
      if (appointments) {
        const appointmentList = JSON.parse(appointments);
        appointmentList.forEach(apt => {
          this.localAppointments.set(apt.id || apt.localId, apt);
        });
      }
    } catch (error) {
      console.error('Failed to load local appointments:', error);
    }
  }

  // Save appointments to local storage
  saveLocalAppointments() {
    try {
      const appointments = Array.from(this.localAppointments.values());
      localStorage.setItem('local_appointments', JSON.stringify(appointments));
    } catch (error) {
      console.error('Failed to save local appointments:', error);
    }
  }

  // Create appointment with sync
  async createAppointment(appointmentData) {
    const localId = this.generateLocalId();
    
    // Create local appointment immediately
    const localAppointment = {
      localId,
      ...appointmentData,
      status: 'pending_sync',
      createdAt: new Date().toISOString(),
      synced: false
    };
    
    this.localAppointments.set(localId, localAppointment);
    this.saveLocalAppointments();
    
    // Notify subscribers
    this.notifySubscribers('appointmentCreated', localAppointment);
    
    // Add to sync queue
    const syncId = dataSyncManager.addToSyncQueue({
      type: 'appointment_create',
      data: {
        localId,
        bookingData: appointmentData
      }
    });
    
    return { localId, syncId, appointment: localAppointment };
  }

  // Handle booking conflicts
  async handleBookingConflict(localAppointment, conflictData) {
    // Notify user about conflict and suggest alternatives
    this.notifySubscribers('bookingConflict', {
      appointment: localAppointment,
      conflict: conflictData,
      suggestedActions: [
        'choose_new_time',
        'cancel_booking',
        'contact_support'
      ]
    });
    
    return { action: 'user_intervention_required' };
  }

  // Setup conflict resolvers
  setupConflictResolvers() {
    dataSyncManager.registerConflictResolver('booking_conflict', 
      async (originalData, conflictError) => {
        const appointment = this.getAppointment(originalData.localId);
        return await this.handleBookingConflict(appointment, conflictError);
      }
    );
  }

  // Subscribe to sync events
  subscribeSyncEvents() {
    dataSyncManager.subscribe((eventType, data) => {
      switch (eventType) {
        case 'syncItemCompleted':
          if (data.item.type.startsWith('appointment_')) {
            this.handleSyncCompleted(data.item);
          }
          break;
          
        case 'syncItemFailed':
          if (data.item.type.startsWith('appointment_')) {
            this.handleSyncFailed(data.item, data.error);
          }
          break;
      }
    });
  }

  // Handle successful sync
  handleSyncCompleted(syncItem) {
    if (syncItem.data.localId) {
      const appointment = this.getAppointment(syncItem.data.localId);
      if (appointment) {
        appointment.synced = true;
        appointment.status = 'confirmed';
        appointment.lastSyncTime = Date.now();
        
        this.saveLocalAppointments();
        this.notifySubscribers('appointmentSynced', appointment);
      }
    }
  }

  // Handle failed sync
  handleSyncFailed(syncItem, error) {
    if (syncItem.data.localId) {
      const appointment = this.getAppointment(syncItem.data.localId);
      if (appointment) {
        appointment.syncError = error;
        appointment.status = 'sync_failed';
        
        this.saveLocalAppointments();
        this.notifySubscribers('appointmentSyncFailed', {
          appointment,
          error
        });
      }
    }
  }

  // Get appointment by ID
  getAppointment(appointmentId) {
    return this.localAppointments.get(appointmentId);
  }

  // Generate local ID
  generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Subscribe to appointment events
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
        console.error('Appointment sync subscriber error:', error);
      }
    });
  }

  // Get sync status
  getSyncStatus() {
    const appointments = Array.from(this.localAppointments.values());
    const synced = appointments.filter(apt => apt.synced).length;
    const pending = appointments.filter(apt => !apt.synced).length;
    
    return {
      total: appointments.length,
      synced,
      pending,
      conflicts: appointments.filter(apt => apt.syncError).length,
      lastSyncTime: Math.max(
        ...appointments.map(apt => apt.lastSyncTime || 0)
      )
    };
  }
}

// Create singleton instance
const appointmentSyncManager = new AppointmentSyncManager();

export default appointmentSyncManager;

// Handle booking conflicts and sync appointments
export async function resolveBookingConflict(bookingId) {
  try {
    const response = await bookingsAPI.checkBookingConflicts({ bookingId });
    return response; // { resolved: true/false, options: [...] }
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
