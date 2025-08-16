import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as appointmentsService from '../../services/appointmentsService';

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.getAppointments();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.createAppointment(appointmentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.cancelAppointment(appointmentId);
      return { appointmentId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/rescheduleAppointment',
  async ({ appointmentId, newDateTime }, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.rescheduleAppointment(appointmentId, newDateTime);
      return { appointmentId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'appointments/fetchAvailableSlots',
  async ({ serviceId, date }, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.getAvailableSlots(serviceId, date);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  appointments: [],
  availableSlots: [],
  selectedDate: null,
  selectedTime: null,
  bookingStep: 1,
  bookingData: {
    serviceId: null,
    date: null,
    time: null,
    notes: '',
    documents: [],
  },
  isLoading: false,
  isCreating: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setBookingStep: (state, action) => {
      state.bookingStep = action.payload;
    },
    updateBookingData: (state, action) => {
      state.bookingData = { ...state.bookingData, ...action.payload };
    },
    clearBookingData: (state) => {
      state.bookingData = {
        serviceId: null,
        date: null,
        time: null,
        notes: '',
        documents: [],
      };
      state.bookingStep = 1;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.appointments.push(action.payload);
        state.bookingData = {
          serviceId: null,
          date: null,
          time: null,
          notes: '',
          documents: [],
        };
        state.bookingStep = 1;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.appointmentId
        );
        if (index !== -1) {
          state.appointments[index].status = 'cancelled';
        }
      })
      // Reschedule appointment
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.appointmentId
        );
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], ...action.payload };
        }
      })
      // Fetch available slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setBookingStep,
  updateBookingData,
  clearBookingData,
  setSelectedDate,
  setSelectedTime,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
