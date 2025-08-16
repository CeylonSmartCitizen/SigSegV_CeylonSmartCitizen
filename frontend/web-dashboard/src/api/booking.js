import { bookingsAPI } from './index.js';
import appointmentSyncManager from './appointmentSync.js';
import serviceDataManager from './serviceDataManager.js';

class BookingManager {
  constructor() {
    this.bookingState = new Map();
    this.validationRules = new Map();
    this.subscribers = new Set();
    this.conflictResolvers = new Map();
    
    // Initialize validation rules
    this.setupValidationRules();
    
    // Setup conflict resolvers
    this.setupConflictResolvers();
  }

  // Setup booking validation rules
  setupValidationRules() {
    this.validationRules.set('required_fields', {
      validate: (bookingData) => {
        const required = ['serviceId', 'dateTime', 'userInfo'];
        const missing = required.filter(field => !bookingData[field]);
        
        if (missing.length > 0) {
          return {
            valid: false,
            errors: missing.map(field => ({
              field,
              message: `${field} is required`
            }))
          };
        }
        
        return { valid: true, errors: [] };
      }
    });

    this.validationRules.set('user_info', {
      validate: (bookingData) => {
        const errors = [];
        const userInfo = bookingData.userInfo || {};
        
        if (!userInfo.fullName || userInfo.fullName.trim().length < 2) {
          errors.push({
            field: 'userInfo.fullName',
            message: 'Full name must be at least 2 characters long'
          });
        }
        
        if (!userInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
          errors.push({
            field: 'userInfo.email',
            message: 'Valid email address is required'
          });
        }
        
        if (!userInfo.phone || !/^\+?[\d\s\-\(\)]{10,}$/.test(userInfo.phone)) {
          errors.push({
            field: 'userInfo.phone',
            message: 'Valid phone number is required'
          });
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      }
    });

    this.validationRules.set('datetime', {
      validate: (bookingData) => {
        const errors = [];
        const bookingDate = new Date(bookingData.dateTime);
        const now = new Date();
        
        // Check if date is in the past
        if (bookingDate <= now) {
          errors.push({
            field: 'dateTime',
            message: 'Booking date must be in the future'
          });
        }
        
        // Check business hours (9 AM to 5 PM)
        const hour = bookingDate.getHours();
        if (hour < 9 || hour >= 17) {
          errors.push({
            field: 'dateTime',
            message: 'Booking must be during business hours (9 AM - 5 PM)'
          });
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      }
    });

    this.validationRules.set('service_availability', {
      validate: async (bookingData) => {
        try {
          const availability = await serviceDataManager.checkServiceAvailability(
            bookingData.serviceId,
            { dateTime: bookingData.dateTime }
          );
          
          if (!availability.available) {
            return {
              valid: false,
              errors: [{
                field: 'dateTime',
                message: 'Selected time slot is not available',
                availableSlots: availability.availableSlots || []
              }]
            };
          }
          
          return { valid: true, errors: [] };
        } catch (error) {
          return {
            valid: false,
            errors: [{
              field: 'serviceId',
              message: 'Unable to verify service availability'
            }]
          };
        }
      }
    });
  }

  // Setup conflict resolvers
  setupConflictResolvers() {
    this.conflictResolvers.set('time_slot_conflict', async (bookingData, conflictInfo) => {
      const availableSlots = conflictInfo.availableSlots || [];
      
      return {
        type: 'time_slot_conflict',
        message: 'The selected time slot is no longer available',
        suggestedActions: [
          {
            action: 'reschedule',
            label: 'Choose a different time',
            data: { availableSlots }
          },
          {
            action: 'cancel',
            label: 'Cancel booking'
          }
        ]
      };
    });

    this.conflictResolvers.set('double_booking', async (bookingData, conflictInfo) => {
      return {
        type: 'double_booking',
        message: 'You already have a booking at this time',
        suggestedActions: [
          {
            action: 'view_existing',
            label: 'View existing booking',
            data: { existingBooking: conflictInfo.existingBooking }
          },
          {
            action: 'reschedule_new',
            label: 'Choose different time for new booking'
          },
          {
            action: 'cancel',
            label: 'Cancel new booking'
          }
        ]
      };
    });
  }

  // Validate booking data
  async validateBooking(bookingData) {
    const allErrors = [];
    let isValid = true;

    // Run all validation rules
    for (const [ruleName, rule] of this.validationRules) {
      try {
        const result = await rule.validate(bookingData);
        
        if (!result.valid) {
          isValid = false;
          allErrors.push(...result.errors.map(error => ({
            ...error,
            rule: ruleName
          })));
        }
      } catch (error) {
        console.error(`Validation rule ${ruleName} failed:`, error);
        isValid = false;
        allErrors.push({
          field: 'general',
          message: `Validation error in ${ruleName}`,
          rule: ruleName
        });
      }
    }

    return {
      valid: isValid,
      errors: allErrors
    };
  }

  // Create booking with validation and conflict detection
  async createBooking(bookingData) {
    const bookingId = this.generateBookingId();
    
    // Set initial state
    this.setBookingState(bookingId, {
      status: 'validating',
      data: bookingData,
      timestamp: Date.now()
    });

    try {
      // Step 1: Validate booking data
      this.notifySubscribers('bookingStatusUpdate', {
        bookingId,
        status: 'validating',
        message: 'Validating booking information...'
      });

      const validationResult = await this.validateBooking(bookingData);
      
      if (!validationResult.valid) {
        this.setBookingState(bookingId, {
          status: 'validation_failed',
          errors: validationResult.errors
        });

        this.notifySubscribers('bookingValidationFailed', {
          bookingId,
          errors: validationResult.errors
        });

        return {
          success: false,
          bookingId,
          errors: validationResult.errors
        };
      }

      // Step 2: Check for conflicts
      this.setBookingState(bookingId, { status: 'checking_conflicts' });
      
      this.notifySubscribers('bookingStatusUpdate', {
        bookingId,
        status: 'checking_conflicts',
        message: 'Checking for scheduling conflicts...'
      });

      const conflictCheck = await this.checkBookingConflicts(bookingData);
      
      if (!conflictCheck.success) {
        const resolution = await this.resolveConflict(
          bookingData, 
          conflictCheck.conflictType, 
          conflictCheck.conflictInfo
        );

        this.setBookingState(bookingId, {
          status: 'conflict_detected',
          conflict: conflictCheck,
          resolution
        });

        this.notifySubscribers('bookingConflictDetected', {
          bookingId,
          conflict: conflictCheck,
          resolution
        });

        return {
          success: false,
          bookingId,
          conflict: conflictCheck,
          resolution
        };
      }

      // Step 3: Submit booking
      this.setBookingState(bookingId, { status: 'submitting' });
      
      this.notifySubscribers('bookingStatusUpdate', {
        bookingId,
        status: 'submitting',
        message: 'Submitting booking...'
      });

      const result = await appointmentSyncManager.createAppointment(bookingData);

      this.setBookingState(bookingId, {
        status: 'submitted',
        appointmentId: result.localId,
        syncId: result.syncId
      });

      this.notifySubscribers('bookingSubmitted', {
        bookingId,
        appointmentId: result.localId,
        appointment: result.appointment
      });

      return {
        success: true,
        bookingId,
        appointmentId: result.localId,
        appointment: result.appointment
      };

    } catch (error) {
      console.error('Booking creation failed:', error);
      
      this.setBookingState(bookingId, {
        status: 'failed',
        error: error.message
      });

      this.notifySubscribers('bookingFailed', {
        bookingId,
        error: error.message
      });

      return {
        success: false,
        bookingId,
        error: error.message
      };
    }
  }

  // Check for booking conflicts
  async checkBookingConflicts(bookingData) {
    try {
      // Check server-side conflicts
      const conflictResult = await bookingsAPI.checkBookingConflicts(bookingData);
      
      if (conflictResult.hasConflicts) {
        return {
          success: false,
          conflictType: conflictResult.conflictType,
          conflictInfo: conflictResult.conflictInfo
        };
      }

      // Check local conflicts
      const localConflicts = this.checkLocalConflicts(bookingData);
      
      if (localConflicts.hasConflicts) {
        return {
          success: false,
          conflictType: localConflicts.conflictType,
          conflictInfo: localConflicts.conflictInfo
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Conflict check failed:', error);
      
      return {
        success: false,
        conflictType: 'system_error',
        conflictInfo: {
          message: 'Unable to verify conflicts. Please try again.',
          error: error.message
        }
      };
    }
  }

  // Check local conflicts (existing appointments)
  checkLocalConflicts(bookingData) {
    const existingAppointments = appointmentSyncManager.getAllAppointments();
    const bookingDate = new Date(bookingData.dateTime);
    
    // Check for overlapping appointments
    const conflictingAppointments = existingAppointments.filter(apt => {
      if (apt.status === 'cancelled') return false;
      
      const aptDate = new Date(apt.dateTime);
      const timeDiff = Math.abs(aptDate.getTime() - bookingDate.getTime());
      
      // Check if within 1 hour window
      return timeDiff < 3600000; // 1 hour in milliseconds
    });

    if (conflictingAppointments.length > 0) {
      return {
        hasConflicts: true,
        conflictType: 'double_booking',
        conflictInfo: {
          existingBooking: conflictingAppointments[0]
        }
      };
    }

    return { hasConflicts: false };
  }

  // Resolve booking conflicts
  async resolveConflict(bookingData, conflictType, conflictInfo) {
    const resolver = this.conflictResolvers.get(conflictType);
    
    if (resolver) {
      return await resolver(bookingData, conflictInfo);
    }

    // Default conflict resolution
    return {
      type: 'unknown_conflict',
      message: 'An unexpected conflict occurred',
      suggestedActions: [
        {
          action: 'retry',
          label: 'Try again'
        },
        {
          action: 'contact_support',
          label: 'Contact support'
        }
      ]
    };
  }

  // Generate booking ID
  generateBookingId() {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Booking state management
  setBookingState(bookingId, state) {
    const existingState = this.bookingState.get(bookingId) || {};
    this.bookingState.set(bookingId, {
      ...existingState,
      ...state,
      lastUpdated: Date.now()
    });
  }

  getBookingState(bookingId) {
    return this.bookingState.get(bookingId);
  }

  // Subscribe to booking events
  subscribe(callback) {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify subscribers
  notifySubscribers(eventType, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Booking subscriber error:', error);
      }
    });
  }
}

// Create singleton instance
const bookingManager = new BookingManager();

export default bookingManager;

// Legacy functions for compatibility
export async function checkAvailability(serviceId, date, time) {
  try {
    const dateTime = `${date}T${time}`;
    const availability = await serviceDataManager.checkServiceAvailability(serviceId, { dateTime });
    return { available: availability.available, reason: availability.reason };
  } catch (error) {
    throw error;
  }
}

export async function submitBooking(bookingData) {
  try {
    // Use the new booking manager for enhanced validation and conflict detection
    const result = await bookingManager.createBooking(bookingData);
    
    if (result.success) {
      return { 
        success: true, 
        bookingId: result.bookingId,
        appointmentId: result.appointmentId,
        appointment: result.appointment
      };
    } else {
      throw new Error(result.error || 'Booking submission failed');
    }
  } catch (error) {
    throw error;
  }
}
