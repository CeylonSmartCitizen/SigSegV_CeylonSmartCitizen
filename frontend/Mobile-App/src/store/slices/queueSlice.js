import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as queueService from '../../services/queueService';

// Async thunks
export const fetchQueueStatus = createAsyncThunk(
  'queue/fetchQueueStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueueStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinQueue = createAsyncThunk(
  'queue/joinQueue',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await queueService.joinQueue(appointmentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveQueue = createAsyncThunk(
  'queue/leaveQueue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.leaveQueue();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQueuePosition = createAsyncThunk(
  'queue/fetchQueuePosition',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueuePosition();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isInQueue: false,
  queuePosition: null,
  estimatedWaitTime: null,
  peopleAhead: 0,
  queueId: null,
  status: null, // 'waiting', 'called', 'in_progress'
  history: [],
  notifications: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateQueuePosition: (state, action) => {
      const { position, estimatedWaitTime, peopleAhead } = action.payload;
      state.queuePosition = position;
      state.estimatedWaitTime = estimatedWaitTime;
      state.peopleAhead = peopleAhead;
      state.lastUpdated = new Date().toISOString();
    },
    updateQueueStatus: (state, action) => {
      state.status = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addQueueNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearQueueNotifications: (state) => {
      state.notifications = [];
    },
    setQueueData: (state, action) => {
      const { isInQueue, queueId, position, status } = action.payload;
      state.isInQueue = isInQueue;
      state.queueId = queueId;
      state.queuePosition = position;
      state.status = status;
    },
  },
  extraReducers: (builder) => {
    // Fetch queue status
    builder
      .addCase(fetchQueueStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { isInQueue, position, estimatedWaitTime, peopleAhead, status, queueId } = action.payload;
        state.isInQueue = isInQueue;
        state.queuePosition = position;
        state.estimatedWaitTime = estimatedWaitTime;
        state.peopleAhead = peopleAhead;
        state.status = status;
        state.queueId = queueId;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchQueueStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Join queue
      .addCase(joinQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInQueue = true;
        state.queueId = action.payload.queueId;
        state.queuePosition = action.payload.position;
        state.estimatedWaitTime = action.payload.estimatedWaitTime;
        state.peopleAhead = action.payload.peopleAhead;
        state.status = 'waiting';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(joinQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Leave queue
      .addCase(leaveQueue.fulfilled, (state) => {
        state.isInQueue = false;
        state.queuePosition = null;
        state.estimatedWaitTime = null;
        state.peopleAhead = 0;
        state.queueId = null;
        state.status = null;
        state.lastUpdated = new Date().toISOString();
      })
      // Fetch queue position
      .addCase(fetchQueuePosition.fulfilled, (state, action) => {
        state.queuePosition = action.payload.position;
        state.estimatedWaitTime = action.payload.estimatedWaitTime;
        state.peopleAhead = action.payload.peopleAhead;
        state.lastUpdated = new Date().toISOString();
      });
  },
});

export const {
  clearError,
  updateQueuePosition,
  updateQueueStatus,
  addQueueNotification,
  clearQueueNotifications,
  setQueueData,
} = queueSlice.actions;

export default queueSlice.reducer;
