import React, { createContext, useContext, useReducer, useEffect } from 'react';
import bookingManager from '../api/booking.js';
import appointmentSyncManager from '../api/appointmentSync.js';

// Booking context
const BookingContext = createContext();

// Booking state reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOOKING_STATUS':
      return {
        ...state,
        bookings: {
          ...state.bookings,
          [action.payload.bookingId]: {
            ...state.bookings[action.payload.bookingId],
            status: action.payload.status,
            message: action.payload.message,
            lastUpdated: Date.now()
          }
        }
      };

    case 'SET_BOOKING_ERROR':
      return {
        ...state,
        bookings: {
          ...state.bookings,
          [action.payload.bookingId]: {
            ...state.bookings[action.payload.bookingId],
            status: 'error',
            error: action.payload.error,
            lastUpdated: Date.now()
          }
        }
      };

    case 'SET_BOOKING_CONFLICT':
      return {
        ...state,
        bookings: {
          ...state.bookings,
          [action.payload.bookingId]: {
            ...state.bookings[action.payload.bookingId],
            status: 'conflict',
            conflict: action.payload.conflict,
            resolution: action.payload.resolution,
            lastUpdated: Date.now()
          }
        }
      };

    case 'SET_BOOKING_SUCCESS':
      return {
        ...state,
        bookings: {
          ...state.bookings,
          [action.payload.bookingId]: {
            ...state.bookings[action.payload.bookingId],
            status: 'success',
            appointmentId: action.payload.appointmentId,
            appointment: action.payload.appointment,
            lastUpdated: Date.now()
          }
        }
      };

    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: {
          ...state.bookings,
          [action.payload.bookingId]: {
            bookingId: action.payload.bookingId,
            status: 'pending',
            data: action.payload.data,
            createdAt: Date.now(),
            lastUpdated: Date.now()
          }
        }
      };

    case 'REMOVE_BOOKING':
      const { [action.payload.bookingId]: removed, ...remainingBookings } = state.bookings;
      return {
        ...state,
        bookings: remainingBookings
      };

    case 'SET_APPOINTMENTS':
      return {
        ...state,
        appointments: action.payload.appointments,
        appointmentsLastUpdated: Date.now()
      };

    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [
          ...state.appointments.filter(apt => apt.localId !== action.payload.appointment.localId),
          action.payload.appointment
        ],
        appointmentsLastUpdated: Date.now()
      };

    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.localId === action.payload.appointmentId || apt.id === action.payload.appointmentId
            ? { ...apt, ...action.payload.updates }
            : apt
        ),
        appointmentsLastUpdated: Date.now()
      };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload.syncStatus
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  bookings: {},
  appointments: [],
  appointmentsLastUpdated: 0,
  syncStatus: {
    total: 0,
    synced: 0,
    pending: 0,
    conflicts: 0
  },
  loading: false,
  error: null
};

// Booking provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    setupEventListeners();
    
    return () => {
      // Cleanup event listeners
      cleanupEventListeners();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } });
      
      // Load appointments
      const appointments = appointmentSyncManager.getAllAppointments();
      dispatch({ type: 'SET_APPOINTMENTS', payload: { appointments } });
      
      // Load sync status
      const syncStatus = appointmentSyncManager.getSyncStatus();
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncStatus } });
      
    } catch (error) {
      console.error('Failed to load initial booking data:', error);
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loading: false } });
    }
  };

  const setupEventListeners = () => {
    // Booking manager events
    const unsubscribeBooking = bookingManager.subscribe((eventType, data) => {
      switch (eventType) {
        case 'bookingStatusUpdate':
          dispatch({
            type: 'SET_BOOKING_STATUS',
            payload: {
              bookingId: data.bookingId,
              status: data.status,
              message: data.message
            }
          });
          break;

        case 'bookingValidationFailed':
          dispatch({
            type: 'SET_BOOKING_ERROR',
            payload: {
              bookingId: data.bookingId,
              error: data.errors
            }
          });
          break;

        case 'bookingConflictDetected':
          dispatch({
            type: 'SET_BOOKING_CONFLICT',
            payload: {
              bookingId: data.bookingId,
              conflict: data.conflict,
              resolution: data.resolution
            }
          });
          break;

        case 'bookingSubmitted':
          dispatch({
            type: 'SET_BOOKING_SUCCESS',
            payload: {
              bookingId: data.bookingId,
              appointmentId: data.appointmentId,
              appointment: data.appointment
            }
          });
          break;

        case 'bookingFailed':
          dispatch({
            type: 'SET_BOOKING_ERROR',
            payload: {
              bookingId: data.bookingId,
              error: data.error
            }
          });
          break;
      }
    });

    // Appointment sync events
    const unsubscribeAppointment = appointmentSyncManager.subscribe((eventType, data) => {
      switch (eventType) {
        case 'appointmentCreated':
          dispatch({
            type: 'ADD_APPOINTMENT',
            payload: { appointment: data }
          });
          break;

        case 'appointmentUpdated':
          dispatch({
            type: 'UPDATE_APPOINTMENT',
            payload: {
              appointmentId: data.localId || data.id,
              updates: data
            }
          });
          break;

        case 'appointmentSynced':
          dispatch({
            type: 'UPDATE_APPOINTMENT',
            payload: {
              appointmentId: data.localId || data.id,
              updates: data
            }
          });
          
          // Update sync status
          const syncStatus = appointmentSyncManager.getSyncStatus();
          dispatch({ type: 'SET_SYNC_STATUS', payload: { syncStatus } });
          break;

        case 'appointmentSyncFailed':
          dispatch({
            type: 'UPDATE_APPOINTMENT',
            payload: {
              appointmentId: data.appointment.localId || data.appointment.id,
              updates: {
                ...data.appointment,
                syncError: data.error
              }
            }
          });
          break;
      }
    });

    // Store cleanup functions
    window.bookingCleanup = () => {
      unsubscribeBooking();
      unsubscribeAppointment();
    };
  };

  const cleanupEventListeners = () => {
    if (window.bookingCleanup) {
      window.bookingCleanup();
      delete window.bookingCleanup;
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    createBooking: async (bookingData) => {
      try {
        const result = await bookingManager.createBooking(bookingData);
        
        if (result.success) {
          dispatch({
            type: 'ADD_BOOKING',
            payload: {
              bookingId: result.bookingId,
              data: bookingData
            }
          });
        }
        
        return result;
      } catch (error) {
        console.error('Booking creation failed:', error);
        throw error;
      }
    },

    resolveBookingConflict: async (bookingId, resolution) => {
      try {
        const result = await bookingManager.updateBookingWithResolution(bookingId, resolution);
        return result;
      } catch (error) {
        console.error('Conflict resolution failed:', error);
        throw error;
      }
    },

    cancelBooking: async (bookingId, reason) => {
      try {
        const result = await bookingManager.cancelBooking(bookingId, reason);
        
        if (result.success) {
          dispatch({
            type: 'REMOVE_BOOKING',
            payload: { bookingId }
          });
        }
        
        return result;
      } catch (error) {
        console.error('Booking cancellation failed:', error);
        throw error;
      }
    },

    refreshAppointments: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { loading: true } });
        
        await appointmentSyncManager.syncWithServer();
        const appointments = appointmentSyncManager.getAllAppointments();
        
        dispatch({ type: 'SET_APPOINTMENTS', payload: { appointments } });
        
        const syncStatus = appointmentSyncManager.getSyncStatus();
        dispatch({ type: 'SET_SYNC_STATUS', payload: { syncStatus } });
        
      } catch (error) {
        console.error('Failed to refresh appointments:', error);
        dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { loading: false } });
      }
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: { error: null } });
    },

    getBookingById: (bookingId) => {
      return state.bookings[bookingId];
    },

    getAppointmentById: (appointmentId) => {
      return state.appointments.find(apt => 
        apt.id === appointmentId || apt.localId === appointmentId
      );
    },

    getPendingAppointments: () => {
      return state.appointments.filter(apt => !apt.synced);
    },

    getBookingStats: () => {
      const bookingStates = Object.values(state.bookings);
      return {
        total: bookingStates.length,
        pending: bookingStates.filter(b => b.status === 'pending').length,
        success: bookingStates.filter(b => b.status === 'success').length,
        error: bookingStates.filter(b => b.status === 'error').length,
        conflict: bookingStates.filter(b => b.status === 'conflict').length
      };
    }
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  return context;
};

// Higher-order component for booking functionality
export const withBooking = (Component) => {
  return function BookingComponent(props) {
    return (
      <BookingProvider>
        <Component {...props} />
      </BookingProvider>
    );
  };
};

export default BookingContext;
