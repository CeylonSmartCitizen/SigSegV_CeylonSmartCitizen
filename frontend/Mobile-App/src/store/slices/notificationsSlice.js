import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationsService from '../../services/notificationsService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationsService.markAsRead(notificationId);
      return { notificationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsService.markAllAsRead();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await notificationsService.updatePreferences(preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    push: true,
    email: true,
    sms: false,
    appointmentReminders: true,
    queueUpdates: true,
    systemAnnouncements: true,
  },
  filter: 'all', // 'all', 'unread', 'appointments', 'queue', 'system'
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          n => n.id === action.payload.notificationId
        );
        if (index !== -1) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      // Update preferences
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = { ...state.preferences, ...action.payload };
      });
  },
});

export const {
  clearError,
  addNotification,
  removeNotification,
  setFilter,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
