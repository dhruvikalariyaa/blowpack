import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserReviews, 
  deleteReview, 
  clearError, 
  clearSuccess 
} from '../store/slices/reviewSlice';
import { 
  PencilIcon, 
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ReviewForm from '../components/reviews/ReviewForm';
import { toast } from 'react-toastify';

const UserReviews = () => {
  const dispatch = useDispatch();
  const { userReviews, loading, error, success } = useSelector(state => state.reviews);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserReviews({ page: currentPage }));
    }
  }, [dispatch, currentPage, isAuthenticated]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await dispatch(deleteReview(reviewId));
        // Refresh the list
        dispatch(fetchUserReviews({ page: currentPage }));
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    // Refresh the list
    dispatch(fetchUserReviews({ page: currentPage }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPagination = () => {
    if (!userReviews.pagination) return null;

    const { currentPage: page, totalPages, hasNextPage, hasPrevPage } = userReviews.pagination;
    const pages = [];

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to view your reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>My Reviews - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">Manage your product reviews</p>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                productId={editingReview?.product?._id}
                orderId={editingReview?.order?._id}
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : userReviews.reviews && userReviews.reviews.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {userReviews.reviews.map((review) => (
                <div key={review._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Review Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={review.product?.images?.[0]?.url || '/placeholder-product.svg'}
                            alt={review.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {review.product?.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill={i < review.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                {review.rating}.0
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              • {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {review.title}
                        </h5>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>

                      {/* Order Info */}
                      {review.order && (
                        <div className="text-sm text-gray-500 mb-3">
                          <p>Order: #{review.order.orderNumber}</p>
                        </div>
                      )}


                      {/* Status */}
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          review.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                        
                        <div className="text-sm text-gray-500">
                          <span>Helpful: {review.helpful || 0}</span>
                          <span className="ml-4">Not Helpful: {review.notHelpful || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
                        className="flex items-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(review._id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't written any reviews yet. Start by reviewing products you've purchased.
              </p>
              <Button onClick={() => window.history.back()}>
                Browse Products
              </Button>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
