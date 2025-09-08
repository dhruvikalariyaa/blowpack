import { useState, useCallback } from 'react';
import { handleApiError, retryRequest } from '../utils/errorHandler';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (requestFn, options = {}) => {
    const { 
      showLoading = true, 
      retry = true, 
      maxRetries = 3,
      onError = null 
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await (retry ? retryRequest(requestFn, maxRetries) : requestFn());
      
      return response;
    } catch (err) {
      const errorInfo = handleApiError(err, err.response);
      setError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw errorInfo;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    makeRequest,
    clearError
  };
};

// Hook for handling 429 errors specifically
export const useRateLimitHandler = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);

  const handleRateLimit = useCallback((error) => {
    if (error.status === 429) {
      setIsRateLimited(true);
      setRetryAfter(error.retryAfter);
      
      // Auto-clear rate limit after retry time
      if (error.retryAfter) {
        setTimeout(() => {
          setIsRateLimited(false);
          setRetryAfter(null);
        }, error.retryAfter * 1000);
      }
    }
  }, []);

  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
    setRetryAfter(null);
  }, []);

  return {
    isRateLimited,
    retryAfter,
    handleRateLimit,
    clearRateLimit
  };
};
