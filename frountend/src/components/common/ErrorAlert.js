import React from 'react';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ErrorAlert = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true,
  isRateLimited = false,
  className = '' 
}) => {
  if (!error) return null;

  const getErrorIcon = () => {
    if (error.status === 429) {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
    if (error.status >= 500) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
    return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
  };

  const getErrorColor = () => {
    if (error.status === 429) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    if (error.status >= 500) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-orange-50 border-orange-200 text-orange-800';
  };

  const formatRetryTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className={`rounded-md border p-4 ${getErrorColor()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {error.status === 429 ? 'Too Many Requests' : 'Error'}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 flex-shrink-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <p className="text-sm">
              {error.message}
            </p>
            {error.status === 429 && error.retryAfter && (
              <p className="text-sm mt-1 font-medium">
                Please try again in {formatRetryTime(error.retryAfter)}.
              </p>
            )}
          </div>
          {showRetry && error.shouldRetry && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                disabled={error.status === 429 && isRateLimited}
                className="inline-flex items-center text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
