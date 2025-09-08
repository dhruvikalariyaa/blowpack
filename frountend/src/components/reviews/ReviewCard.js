import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  PencilIcon, 
  TrashIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import { markReviewHelpful, deleteReview } from '../../store/slices/reviewSlice';
import { toast } from 'react-toastify';

const ReviewCard = ({ 
  review, 
  showActions = true, 
  onEdit = null, 
  onDelete = null,
  isUserReview = false 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpful = async (isHelpful) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(markReviewHelpful({ 
        reviewId: review._id, 
        isHelpful 
      }));
      toast.success('Thank you for your feedback');
    } catch (error) {
      toast.error('Failed to record feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await dispatch(deleteReview(review._id));
        if (onDelete) {
          onDelete();
        }
        toast.success('Review deleted successfully');
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">
                {review.user?.name || 'Anonymous'}
              </h4>
              {review.isVerified && (
                <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm text-gray-600">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h5 className="font-semibold text-gray-900 mb-2">
          {review.title}
        </h5>
        <p className="text-gray-700 leading-relaxed">
          {review.comment}
        </p>
      </div>


      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* Helpful buttons */}
          <button
            onClick={() => handleHelpful(true)}
            disabled={isSubmitting}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <HandThumbUpIcon className="h-4 w-4" />
            <span>Helpful ({review.helpful || 0})</span>
          </button>
          
          <button
            onClick={() => handleHelpful(false)}
            disabled={isSubmitting}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <HandThumbDownIcon className="h-4 w-4" />
            <span>Not Helpful ({review.notHelpful || 0})</span>
          </button>
        </div>

        {/* User actions */}
        {isUserReview && showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(review)}
                className="flex items-center space-x-1"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        )}
      </div>

      {/* Order info for verified reviews */}
      {review.order && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Verified purchase • Order #{review.order.orderNumber}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
