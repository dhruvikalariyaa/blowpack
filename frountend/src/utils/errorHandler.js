import React from 'react';

// Error handling utility for API responses
export const handleApiError = (error, response = null) => {
  let errorMessage = 'Something went wrong. Please try again.';
  let shouldRetry = false;
  let retryAfter = null;

  // Handle different types of errors
  if (response) {
    const status = response.status;
    
    switch (status) {
      case 400:
        errorMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        errorMessage = 'Please login to continue.';
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorMessage = 'This action conflicts with existing data. Please refresh and try again.';
        break;
      case 422:
        errorMessage = 'Please check your input and try again.';
        break;
      case 429:
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
        shouldRetry = true;
        retryAfter = response.headers?.get('Retry-After') || 60;
        // Add retry information to the error
        error.retryAfter = retryAfter;
        error.isRateLimited = true;
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        shouldRetry = true;
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        shouldRetry = true;
        break;
      default:
        errorMessage = `Request failed with status ${status}. Please try again.`;
        shouldRetry = status >= 500;
    }

    // Try to get error message from response body
    if (response.data?.message) {
      errorMessage = response.data.message;
    }
  } else if (error.message) {
    // Network or other errors
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
      shouldRetry = true;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      shouldRetry = true;
    } else {
      errorMessage = error.message;
    }
  }

  return {
    message: errorMessage,
    shouldRetry,
    retryAfter,
    status: response?.status || 0
  };
};

// Retry utility with exponential backoff
export const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 429 errors - respect rate limiting
      if (error.response?.status === 429) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Error messages for different scenarios
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment before trying again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Error boundary component for React
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
