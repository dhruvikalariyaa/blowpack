import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, updateReview } from '../../store/slices/reviewSlice';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import Input from '../common/Input';
import { toast } from 'react-toastify';

const ReviewForm = ({ 
  productId, 
  orderId, 
  existingReview = null, 
  onSuccess = null, 
  onCancel = null 
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.reviews);
  
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || ''
  });
  
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
    
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (formData.rating < 1) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    } else if (formData.comment.trim().length > 500) {
      newErrors.comment = 'Comment cannot exceed 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const reviewData = {
        productId,
        orderId,
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim()
      };

      if (existingReview) {
        await dispatch(updateReview({ 
          reviewId: existingReview._id, 
          reviewData 
        }));
        toast.success('Review updated successfully');
      } else {
        await dispatch(createReview(reviewData));
        toast.success('Review created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to save review');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? 'Edit Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating
            rating={formData.rating}
            interactive={true}
            onRatingChange={handleRatingChange}
            size="lg"
            showNumber={true}
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <Input
            label="Review Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Give your review a title"
            error={errors.title}
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Share your experience with this product"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.comment ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment ? (
              <p className="text-sm text-red-600">{errors.comment}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.comment.length}/500 characters
              </p>
            )}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading || formData.rating < 1}
          >
            {existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
