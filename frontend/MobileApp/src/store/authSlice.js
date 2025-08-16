import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utility/api';
import secureStorage from '../utility/secureStorage';

// Async thunks for login, logout, fetch profile, etc.
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.loginUser(credentials.identifier, credentials.password);
    await secureStorage.saveToken(response.data.token);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.logout();
    await secureStorage.removeToken();
    return true;
  } catch (err) {
    return rejectWithValue('Logout failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.getProfile();
    return response.data;
  } catch (err) {
    return rejectWithValue('Failed to fetch profile');
  }
});

// If you want to persist language/user preferences to backend, implement and uncomment below when backend is ready.
// export const updatePreferences = createAsyncThunk('auth/updatePreferences', async (prefs, { rejectWithValue }) => {
//   try {
//     const response = await api.updatePreferences(prefs);
//     return response.data;
//   } catch (err) {
//     return rejectWithValue('Failed to update preferences');
//   }
// });

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  preferences: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setPreferences(state, action) {
      state.preferences = action.payload;
    },
    resetAuth(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.preferences = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.preferences = {};
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
      // .addCase(updatePreferences.fulfilled, (state, action) => {
      //   state.preferences = action.payload;
      // });
  },
});

export const { setToken, setUser, setPreferences, resetAuth } = authSlice.actions;
export default authSlice.reducer;
