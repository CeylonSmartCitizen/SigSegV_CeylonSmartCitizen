import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as servicesService from '../../services/servicesService';

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServices(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServiceCategories = createAsyncThunk(
  'services/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServiceCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServiceDetails = createAsyncThunk(
  'services/fetchServiceDetails',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServiceDetails(serviceId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchServices = createAsyncThunk(
  'services/searchServices',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await servicesService.searchServices(query, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  services: [],
  categories: [],
  selectedService: null,
  searchResults: [],
  filters: {
    category: null,
    department: null,
    feeRange: { min: 0, max: 10000 },
    sortBy: 'name',
    sortOrder: 'asc',
  },
  viewMode: 'grid', // 'grid' or 'list'
  isLoading: false,
  isSearching: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchServiceCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch service details
      .addCase(fetchServiceDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServiceDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search services
      .addCase(searchServices.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  setViewMode,
  setSelectedService,
  clearSearchResults,
} = servicesSlice.actions;

export default servicesSlice.reducer;
