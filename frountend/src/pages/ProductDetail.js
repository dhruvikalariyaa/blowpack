import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { fetchProduct, addToCart, addToWishlist } from '../store/slices/productSlice';
import { addToCart as addToCartAction } from '../store/slices/cartSlice';
import { addToWishlist as addToWishlistAction } from '../store/slices/wishlistSlice';
import { fetchProductReviews } from '../store/slices/reviewSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, relatedProducts, loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = React.useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [userDeliveredOrders, setUserDeliveredOrders] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined') {
      dispatch(fetchProduct(id));
      dispatch(fetchProductReviews({ productId: id }));
    } else if (id === 'undefined') {
      toast.error('Invalid product ID');
    }
  }, [dispatch, id]);

  // Check if user can write review for this product
  useEffect(() => {
    const checkCanWriteReview = async () => {
      if (!isAuthenticated || !currentProduct) {
        setCanWriteReview(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const deliveredOrders = data.data.orders.filter(order => 
            order.orderStatus === 'delivered'
          );
          
          setUserDeliveredOrders(deliveredOrders);
          
          // Check if any delivered order contains this product
          const hasDeliveredOrderWithProduct = deliveredOrders.some(order =>
            order.items.some(item => 
              (item.product._id || item.product) === currentProduct._id
            )
          );
          
          setCanWriteReview(hasDeliveredOrderWithProduct);
        }
      } catch (error) {
        console.error('Error checking user orders:', error);
        setCanWriteReview(false);
      }
    };

    checkCanWriteReview();
  }, [isAuthenticated, currentProduct]);

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = () => {
    // Refresh reviews after deletion
    dispatch(fetchProductReviews({ productId: id }));
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    // Refresh reviews and product data after creation/update
    dispatch(fetchProductReviews({ productId: id }));
    dispatch(fetchProduct(id)); // Refresh product data to get updated ratings
    
    // Show success message
    toast.success('Review added successfully!');
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!quantity || quantity === 0 || quantity === '') {
      toast.error('Please select a quantity greater than 0');
      return;
    }

    try {
      await dispatch(addToCartAction({ productId: currentProduct._id, quantity }));
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await dispatch(addToWishlistAction(currentProduct._id));
      toast.success('Product added to wishlist');
    } catch (error) {
      toast.error('Failed to add product to wishlist');
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? (currentProduct.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === (currentProduct.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{currentProduct.name} - Packwell Plastic Industries</title>
        <meta name="description" content={currentProduct.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img
                  src={currentProduct.images?.[selectedImageIndex]?.url || currentProduct.images?.[selectedImageIndex] || '/placeholder-product.svg'}
                  alt={currentProduct.name}
                  className="w-full h-full object-contain bg-white p-4 cursor-pointer"
                  onClick={() => handleImageClick(selectedImageIndex)}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
              </div>
              
              {/* Image Navigation Arrows */}
              {currentProduct.images?.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {currentProduct.images?.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {currentProduct.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {currentProduct.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {currentProduct.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-primary-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={image.url || image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover bg-white"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Compact Single Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-5">
              {/* Product Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {currentProduct.name}
                  </h1>
                  {currentProduct.isFeatured && (
                    <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(currentProduct.ratings?.average || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {currentProduct.ratings?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ({currentProduct.ratings?.count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary-600">
                  ₹{currentProduct.price}
                </span>
                {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                  <div className="flex flex-col">
                    <span className="text-lg text-gray-500 line-through">
                      ₹{currentProduct.originalPrice}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">
                      Save ₹{currentProduct.originalPrice - currentProduct.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">SKU</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product Code</p>
                      <p className="font-semibold text-gray-900 text-sm">{currentProduct.sku}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">CAT</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900 text-sm">{currentProduct.category?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product Description</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{currentProduct.description}</p>
                
                {(currentProduct.material || currentProduct.color) && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {currentProduct.material && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">M</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Material</p>
                          <p className="font-semibold text-gray-900 text-sm">{currentProduct.material}</p>
                        </div>
                      </div>
                    )}
                    
                    {currentProduct.color && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-xs">C</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Color</p>
                          <p className="font-semibold text-gray-900 text-sm">{currentProduct.color}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                {/* Quantity Input */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder=""
                    />
                    <span className="text-xs text-gray-500">units</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 text-sm font-semibold"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                    className="px-6 py-3 border-2"
                  >
                    <HeartIcon className="h-5 w-5" />
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
       

        {/* Reviews Section */}
        <div className="mt-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <StarIcon className="h-4 w-4 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Reviews
                </h2>
              </div>
              <p className="text-gray-600 text-xs">
                See what our customers are saying about this product
              </p>
            </div>

            {/* Review Form */}
            {isAuthenticated && canWriteReview && (
              <div className="mb-4">
                {!showReviewForm ? (
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-3 rounded-md border border-primary-200 text-center">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <StarIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Share Your Experience
                    </h3>
                    <p className="text-gray-600 mb-3 text-xs max-w-md mx-auto">
                      You purchased this product and it has been delivered. Help other customers by writing a review.
                    </p>
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1 rounded-md font-medium text-xs"
                    >
                      Write a Review
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <ReviewForm
                      productId={currentProduct._id}
                      orderId={null}
                      existingReview={editingReview}
                      onSuccess={handleReviewSuccess}
                      onCancel={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Message for users who can't write reviews */}
            {isAuthenticated && !canWriteReview && (
              <div className="mb-4">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <StarIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Write a Review
                  </h3>
                  <p className="text-gray-600 mb-2 text-xs">
                    You can write a review for this product after purchasing it and receiving your order.
                  </p>
                  <p className="text-xs text-gray-500">
                    Only customers who have received delivered orders can write reviews.
                  </p>
                </div>
              </div>
            )}


            {/* Reviews List */}
            <ReviewList
              productId={currentProduct._id}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain bg-white p-2"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600">
                        ₹{product.price}
                      </span>
                      <a
                        href={`/products/${product._id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </button>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={currentProduct.images?.[selectedImageIndex]?.url || currentProduct.images?.[selectedImageIndex] || '/placeholder-product.svg'}
                  alt={currentProduct.name}
                  className="max-w-full max-h-[80vh] object-contain bg-white rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />

                {/* Navigation Arrows */}
                {currentProduct.images?.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg"
                    >
                      <ChevronLeftIcon className="h-8 w-8 text-gray-700" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg"
                    >
                      <ChevronRightIcon className="h-8 w-8 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {currentProduct.images?.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    {selectedImageIndex + 1} / {currentProduct.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {currentProduct.images?.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2 overflow-x-auto max-w-full">
                  {currentProduct.images.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                        selectedImageIndex === index
                          ? 'border-primary-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image.url || image}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover bg-white"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
