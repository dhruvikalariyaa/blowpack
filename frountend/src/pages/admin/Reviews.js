import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { 
  fetchAllReviews, 
  approveReview, 
  clearError, 
  clearSuccess 
} from '../../store/slices/reviewSlice';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const dispatch = useDispatch();
  const { allReviews, loading, error, success } = useSelector(state => state.reviews);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    rating: ''
  });

  useEffect(() => {
    dispatch(fetchAllReviews({ 
      page: currentPage, 
      ...filters 
    }));
  }, [dispatch, currentPage, filters]);

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

  const handleApprove = async (reviewId, isApproved) => {
    try {
      await dispatch(approveReview({ reviewId, isApproved }));
      // Refresh the list
      dispatch(fetchAllReviews({ 
        page: currentPage, 
        ...filters 
      }));
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPagination = () => {
    if (!allReviews.pagination) return null;

    const { currentPage: page, totalPages, hasNextPage, hasPrevPage } = allReviews.pagination;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Reviews - Packwell Plastic Industries</title>
      </Helmet>
      
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate customer reviews</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ status: '', rating: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : allReviews.reviews && allReviews.reviews.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {allReviews.reviews.map((review) => (
                <div key={review._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Review Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.user?.name || 'Anonymous'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {review.user?.email}
                          </p>
                        </div>
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
                      </div>

                      {/* Review Content */}
                      <div className="mb-3">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {review.title}
                        </h5>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>

                      {/* Product and Order Info */}
                      <div className="text-sm text-gray-500 mb-3">
                        <p>Product: {review.product?.name}</p>
                        {review.order && (
                          <p>Order: #{review.order.orderNumber}</p>
                        )}
                        <p>Date: {formatDate(review.createdAt)}</p>
                      </div>


                      {/* Helpful Count */}
                      <div className="text-sm text-gray-500">
                        <span>Helpful: {review.helpful || 0}</span>
                        <span className="ml-4">Not Helpful: {review.notHelpful || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        review.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(review._id, !review.isApproved)}
                        className={review.isApproved ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {review.isApproved ? (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews found</p>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
