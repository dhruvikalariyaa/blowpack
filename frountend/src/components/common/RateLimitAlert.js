import React from 'react';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

const RateLimitAlert = ({ retryAfter, onRetry }) => {
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Too Many Requests
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              You've made too many requests. Please wait{' '}
              <span className="font-medium">
                {retryAfter ? formatTime(retryAfter) : 'a moment'}
              </span>{' '}
              before trying again.
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm text-yellow-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Rate limit resets automatically</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitAlert;
