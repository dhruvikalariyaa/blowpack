import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  StarIcon, 
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { fetchOrder } from '../store/slices/orderSlice';
import { createReview, fetchProductReviews } from '../store/slices/reviewSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';
import { toast } from 'react-toastify';

const OrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, loading: orderLoading } = useSelector(state => state.orders);
  const { loading: reviewLoading } = useSelector(state => state.reviews);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState(new Set());

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId));
    }
  }, [dispatch, orderId]);

  const handleProductSelect = (product) => {
    console.log('Product selected:', product);
    console.log('Product image:', product.image);
    console.log('Product name:', product.name);
    setSelectedProduct(product);
    setRating(0);
    setTitle('');
    setComment('');
    
    // Scroll to review form
    setTimeout(() => {
      const reviewForm = document.getElementById('review-form');
      if (reviewForm) {
        reviewForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product to review');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a review title');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    try {
      const reviewData = {
        productId: selectedProduct._id,
        orderId: currentOrder._id,
        rating,
        title: title.trim(),
        comment: comment.trim()
      };

      console.log('Sending review data:', reviewData);
      console.log('Selected product:', selectedProduct);
      console.log('Current order:', currentOrder);

      await dispatch(createReview(reviewData)).unwrap();
      
      // Add to submitted reviews
      setSubmittedReviews(prev => new Set([...prev, selectedProduct._id]));
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setSelectedProduct(null);
      
      toast.success('Review submitted successfully!');
      
      // Refresh product reviews
      dispatch(fetchProductReviews(selectedProduct._id));
      
    } catch (error) {
      toast.error(error || 'Failed to submit review');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (orderLoading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const availableProducts = currentOrder.items.filter(item => 
    !submittedReviews.has(item.product._id || item.product)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Write Review - Order #{currentOrder.orderNumber} - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Orders</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Write Review</h1>
          <p className="text-gray-600 mt-2">
            Order #{currentOrder.orderNumber} • Delivered on {formatDate(currentOrder.deliveredAt)}
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {currentOrder.items.map((item, index) => {
                const productId = item.product._id || item.product;
                const isReviewed = submittedReviews.has(productId);
                
                return (
                  <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    isReviewed ? 'bg-green-50 border-green-200' : 
                    selectedProduct && (selectedProduct._id === productId || selectedProduct === productId) ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.image || item.product?.images?.[0] || '/placeholder-product.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {isReviewed ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircleIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Reviewed</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleProductSelect(item.product)}
                          className="flex items-center space-x-2"
                        >
                          <StarIcon className="h-4 w-4" />
                          <span>Review This Product</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Form */}
        {!selectedProduct && availableProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <StarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Select a Product to Review
            </h3>
            <p className="text-blue-700">
              Click "Review This Product" on any item above to write your review
            </p>
          </div>
        )}

        {selectedProduct && (
          <div id="review-form" className="bg-white rounded-lg shadow-sm border border-primary-200">
            <div className="bg-primary-50 px-6 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-primary-900">Write Your Review</h2>
              <p className="text-primary-700">Share your experience with this product</p>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.images?.[0] || selectedProduct.image || '/placeholder-product.svg'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-600">Write your review for this product</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                    interactive={true}
                  />
                  {rating > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {rating} star{rating > 1 ? 's' : ''} - {
                        rating === 1 ? 'Poor' :
                        rating === 2 ? 'Fair' :
                        rating === 3 ? 'Good' :
                        rating === 4 ? 'Very Good' : 'Excellent'
                      }
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your review a title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {title.length}/100 characters
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comment *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={reviewLoading || rating === 0 || !title.trim() || !comment.trim()}
                    className="flex items-center space-x-2"
                  >
                    {reviewLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <StarIcon className="h-4 w-4" />
                    )}
                    <span>Submit Review</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* All Reviews Submitted */}
        {availableProducts.length === 0 && submittedReviews.size > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              All Reviews Submitted!
            </h3>
            <p className="text-green-700 mb-4">
              Thank you for reviewing all products from this order.
            </p>
            <Button onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReview;
