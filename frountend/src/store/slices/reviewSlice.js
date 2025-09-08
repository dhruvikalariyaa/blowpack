import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/reviews', reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async ({ productId, page = 1, limit = 10, rating = null }, { rejectWithValue }) => {
    try {
      let url = `/api/reviews/product/${productId}?page=${page}&limit=${limit}`;
      if (rating) {
        url += `&rating=${rating}`;
      }
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'review/fetchUserReviews',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/reviews/user?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/reviews/${reviewId}`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'review/markReviewHelpful',
  async ({ reviewId, isHelpful }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/reviews/${reviewId}/helpful`, { isHelpful }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { reviewId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark review helpful');
    }
  }
);

// Admin thunks
export const fetchAllReviews = createAsyncThunk(
  'review/fetchAllReviews',
  async ({ page = 1, limit = 20, status = null, rating = null }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      let url = `/api/reviews/admin/all?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      if (rating) {
        url += `&rating=${rating}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all reviews');
    }
  }
);

export const approveReview = createAsyncThunk(
  'review/approveReview',
  async ({ reviewId, isApproved }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/reviews/${reviewId}/approve`, { isApproved }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review status');
    }
  }
);

const initialState = {
  productReviews: {
    reviews: [],
    ratingDistribution: [],
    pagination: null,
    loading: false,
    error: null
  },
  userReviews: {
    reviews: [],
    pagination: null,
    loading: false,
    error: null
  },
  allReviews: {
    reviews: [],
    pagination: null,
    loading: false,
    error: null
  },
  loading: false,
  error: null,
  success: null
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearProductReviews: (state) => {
      state.productReviews = {
        reviews: [],
        ratingDistribution: [],
        pagination: null,
        loading: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Review created successfully';
        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.productReviews.loading = true;
        state.productReviews.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviews.loading = false;
        state.productReviews.reviews = action.payload.reviews;
        state.productReviews.ratingDistribution = action.payload.ratingDistribution;
        state.productReviews.pagination = action.payload.pagination;
        state.productReviews.error = null;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.productReviews.loading = false;
        state.productReviews.error = action.payload;
      })
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.userReviews.loading = true;
        state.userReviews.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.userReviews.loading = false;
        state.userReviews.reviews = action.payload.reviews;
        state.userReviews.pagination = action.payload.pagination;
        state.userReviews.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.userReviews.loading = false;
        state.userReviews.error = action.payload;
      })
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Review updated successfully';
        state.error = null;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Review deleted successfully';
        state.error = null;
        // Remove from user reviews
        state.userReviews.reviews = state.userReviews.reviews.filter(
          review => review._id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark review helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, helpful, notHelpful } = action.payload;
        // Update in product reviews
        const productReview = state.productReviews.reviews.find(r => r._id === reviewId);
        if (productReview) {
          productReview.helpful = helpful;
          productReview.notHelpful = notHelpful;
        }
        // Update in user reviews
        const userReview = state.userReviews.reviews.find(r => r._id === reviewId);
        if (userReview) {
          userReview.helpful = helpful;
          userReview.notHelpful = notHelpful;
        }
      })
      // Fetch all reviews (Admin)
      .addCase(fetchAllReviews.pending, (state) => {
        state.allReviews.loading = true;
        state.allReviews.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.allReviews.loading = false;
        state.allReviews.reviews = action.payload.reviews;
        state.allReviews.pagination = action.payload.pagination;
        state.allReviews.error = null;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.allReviews.loading = false;
        state.allReviews.error = action.payload;
      })
      // Approve review (Admin)
      .addCase(approveReview.fulfilled, (state, action) => {
        const updatedReview = action.payload.review;
        // Update in all reviews
        const index = state.allReviews.reviews.findIndex(r => r._id === updatedReview._id);
        if (index !== -1) {
          state.allReviews.reviews[index] = updatedReview;
        }
      });
  }
});

export const { clearError, clearSuccess, clearProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
