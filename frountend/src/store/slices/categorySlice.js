import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleApiError, retryRequest } from '../../utils/errorHandler';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Check if we already have categories and this is not a forced refresh
      const state = getState();
      if (state.categories.categories.length > 0 && !params.forceRefresh) {
        return {
          categories: state.categories.categories,
          pagination: state.categories.pagination
        };
      }

      const requestFn = async () => {
        const response = await axios.get('/api/categories', { params });
        return response.data.data;
      };

      // Use retry logic for rate limiting
      const data = await retryRequest(requestFn, 3, 1000);
      return data;
    } catch (error) {
      const errorInfo = handleApiError(error, error.response);
      
      // If it's a 429 error, include retry information
      if (error.response?.status === 429) {
        return rejectWithValue({
          message: errorInfo.message,
          isRateLimited: true,
          retryAfter: errorInfo.retryAfter,
          status: 429
        });
      }
      
      return rejectWithValue(errorInfo.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategory = createAsyncThunk(
  'categories/fetchCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const requestFn = async () => {
        const response = await axios.get(`/api/categories/${categoryId}`);
        return response.data.data;
      };

      // Use retry logic for rate limiting
      const data = await retryRequest(requestFn, 3, 1000);
      return data;
    } catch (error) {
      const errorInfo = handleApiError(error, error.response);
      return rejectWithValue(errorInfo.message || 'Failed to fetch category');
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  isRateLimited: false,
  retryAfter: null,
  lastFetched: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    setRateLimited: (state, action) => {
      state.isRateLimited = action.payload.isRateLimited;
      state.retryAfter = action.payload.retryAfter;
    },
    clearRateLimit: (state) => {
      state.isRateLimited = false;
      state.retryAfter = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
        state.error = null;
        state.isRateLimited = false;
        state.retryAfter = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        
        // Handle rate limit error with retry information
        if (action.payload && typeof action.payload === 'object' && action.payload.isRateLimited) {
          state.error = action.payload.message;
          state.isRateLimited = true;
          state.retryAfter = action.payload.retryAfter || 60;
        } else {
          state.error = action.payload;
          state.isRateLimited = false;
          state.retryAfter = null;
        }
      })
      // Fetch single category
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload.category;
        state.error = null;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCategory, setRateLimited, clearRateLimit } = categorySlice.actions;
export default categorySlice.reducer;
