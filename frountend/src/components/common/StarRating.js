import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showNumber = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= Math.floor(rating);
        const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${sizeClasses[size]}`}
          >
            {isFilled ? (
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            ) : isHalfFilled ? (
              <div className="relative">
                <StarIconOutline className={`${sizeClasses[size]} text-yellow-400`} />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
                </div>
              </div>
            ) : (
              <StarIconOutline className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
