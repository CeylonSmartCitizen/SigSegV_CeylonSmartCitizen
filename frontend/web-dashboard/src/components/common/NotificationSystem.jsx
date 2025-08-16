import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, RefreshCw, AlertTriangle } from 'lucide-react';

// Action Types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL_NOTIFICATIONS: 'CLEAR_ALL_NOTIFICATIONS',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Default notification configuration
const DEFAULT_NOTIFICATION_CONFIG = {
  duration: 5000,
  position: 'top-right',
  allowDismiss: true,
  showProgress: true,
  persistent: false
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => 
          notification.id !== action.payload
        )
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: []
};

// Create context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const notificationConfig = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };

  // Generate unique ID for notifications
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const fullNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      timestamp: new Date().toISOString(),
      ...notificationConfig,
      ...notification
    };

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: fullNotification
    });

    // Auto-remove notification if not persistent
    if (!fullNotification.persistent && fullNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, fullNotification.duration);
    }

    return id;
  }, [notificationConfig]);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL_NOTIFICATIONS });
  }, []);

  // Update notification
  const updateNotification = useCallback((id, updates) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION,
      payload: { id, updates }
    });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: options.title || 'Success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: options.title || 'Error',
      message,
      persistent: options.persistent !== undefined ? options.persistent : true,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: options.title || 'Warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: options.title || 'Information',
      message,
      ...options
    });
  }, [addNotification]);

  // Show booking-specific notifications
  const showBookingSuccess = useCallback((appointmentData, options = {}) => {
    return showSuccess(
      `Your appointment has been successfully booked for ${appointmentData.date} at ${appointmentData.time}`,
      {
        title: 'Booking Confirmed',
        actions: [
          {
            label: 'View Details',
            onClick: () => options.onViewDetails?.(appointmentData)
          },
          {
            label: 'Add to Calendar',
            onClick: () => options.onAddToCalendar?.(appointmentData)
          }
        ],
        duration: 8000,
        ...options
      }
    );
  }, [showSuccess]);

  const showBookingError = useCallback((error, options = {}) => {
    const errorActions = [];
    
    if (error.code === 'BOOKING_CONFLICT') {
      errorActions.push({
        label: 'View Available Times',
        onClick: () => options.onViewAlternatives?.()
      });
    }
    
    if (error.retryable) {
      errorActions.push({
        label: 'Try Again',
        onClick: () => options.onRetry?.()
      });
    }

    return showError(
      error.message || 'Failed to book appointment. Please try again.',
      {
        title: 'Booking Failed',
        actions: errorActions,
        ...options
      }
    );
  }, [showError]);

  const showNetworkError = useCallback((error, options = {}) => {
    return showError(
      'Unable to connect to the server. Please check your internet connection.',
      {
        title: 'Connection Error',
        actions: [
          {
            label: 'Retry',
            onClick: () => options.onRetry?.()
          }
        ],
        ...options
      }
    );
  }, [showError]);

  const contextValue = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showBookingSuccess,
    showBookingError,
    showNetworkError
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Icon Component
const NotificationIcon = ({ type, className = "" }) => {
  const iconProps = { size: 20, className };

  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return <CheckCircle {...iconProps} className={`${className} text-green-500`} />;
    case NOTIFICATION_TYPES.ERROR:
      return <XCircle {...iconProps} className={`${className} text-red-500`} />;
    case NOTIFICATION_TYPES.WARNING:
      return <AlertTriangle {...iconProps} className={`${className} text-yellow-500`} />;
    case NOTIFICATION_TYPES.INFO:
    default:
      return <Info {...iconProps} className={`${className} text-blue-500`} />;
  }
};

// Progress Bar Component for notifications
const NotificationProgress = ({ duration, onComplete }) => {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (duration <= 0) return;

    const interval = 50; // Update every 50ms
    const decrement = (100 * interval) / duration;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          onComplete?.();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  if (duration <= 0) return null;

  return (
    <div className="notification-progress">
      <div 
        className="notification-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Individual Notification Component
const NotificationItem = ({ notification, onRemove, onUpdate }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleActionClick = (action) => {
    if (action.dismissOnClick !== false) {
      handleRemove();
    }
    action.onClick?.();
  };

  return (
    <div
      className={`notification-item notification-item--${notification.type} ${
        isVisible ? 'notification-item--visible' : ''
      } ${isRemoving ? 'notification-item--removing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-content">
        <div className="notification-header">
          <NotificationIcon type={notification.type} />
          <div className="notification-text">
            {notification.title && (
              <h4 className="notification-title">{notification.title}</h4>
            )}
            <p className="notification-message">{notification.message}</p>
          </div>
          {notification.allowDismiss && (
            <button
              onClick={handleRemove}
              className="notification-dismiss"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {notification.actions && notification.actions.length > 0 && (
          <div className="notification-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`notification-action ${action.variant || 'primary'}`}
              >
                {action.icon && <action.icon size={16} />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {notification.showProgress && !notification.persistent && (
        <NotificationProgress
          duration={notification.duration}
          onComplete={handleRemove}
        />
      )}
    </div>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification, updateNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          onUpdate={updateNotification}
        />
      ))}
    </div>
  );
};

// Error Boundary for API Integration
export class NotificationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Notification Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="notification-error-fallback">
          <AlertCircle size={24} className="text-red-500" />
          <div>
            <h3>Something went wrong with notifications</h3>
            <p>Please refresh the page to continue</p>
            <button 
              onClick={() => window.location.reload()}
              className="notification-action primary"
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Toast Hook for simple notifications
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  
  return {
    toast: {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }
  };
};

// Export everything
export default NotificationProvider;
