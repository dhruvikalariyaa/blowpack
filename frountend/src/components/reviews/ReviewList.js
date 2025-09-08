import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StarIcon } from '@heroicons/react/24/solid';
import { fetchProductReviews } from '../../store/slices/reviewSlice';
import ReviewCard from './ReviewCard';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const ReviewList = ({ productId, onEditReview = null, onDeleteReview = null }) => {
  const dispatch = useDispatch();
  const { productReviews, userReviews } = useSelector(state => state.reviews);
  const { user } = useSelector(state => state.auth);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({ 
        productId, 
        page: currentPage, 
        rating: selectedRating 
      }));
    }
  }, [dispatch, productId, currentPage, selectedRating]);

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setCurrentPage(1);
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    // You can implement sorting logic here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!productReviews.pagination) return null;

    const { currentPage: page, totalPages, hasNextPage, hasPrevPage } = productReviews.pagination;
    const pages = [];

    // Calculate page numbers to show
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        
        {pages.map(pageNum => (
          <Button
            key={pageNum}
            variant={pageNum === page ? "primary" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    );
  };

  if (productReviews.loading && currentPage === 1) {
    return <LoadingSpinner size="lg" className="py-8" />;
  }

  return (
    <div className="space-y-6">
      {/* Rating Distribution */}
      {productReviews.ratingDistribution && productReviews.ratingDistribution.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const distribution = productReviews.ratingDistribution.find(d => d._id === rating);
              const count = distribution?.count || 0;
              const total = productReviews.ratingDistribution.reduce((sum, d) => sum + d.count, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <button
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex items-center space-x-1 ${
                      selectedRating === rating ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium">{rating}</span>
                    <StarIcon className="h-4 w-4" />
                  </button>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
            <div className="flex space-x-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedRating === rating
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating}+
                </button>
              ))}
              {selectedRating && (
                <button
                  onClick={() => setSelectedRating(null)}
                  className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {productReviews.reviews && productReviews.reviews.length > 0 ? (
        <div className="space-y-4">
          {productReviews.reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={onEditReview}
              onDelete={onDeleteReview}
              isUserReview={user && review.user?._id === user._id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews found for this product.</p>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Loading for pagination */}
      {productReviews.loading && currentPage > 1 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
};

export default ReviewList;
