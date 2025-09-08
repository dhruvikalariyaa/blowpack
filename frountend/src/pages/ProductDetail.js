import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon
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
  const [quantity, setQuantity] = React.useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [userDeliveredOrders, setUserDeliveredOrders] = useState([]);

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
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={currentProduct.images?.[0]?.url || '/placeholder-product.svg'}
                alt={currentProduct.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {currentProduct.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {currentProduct.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={`${currentProduct.name} ${index + 2}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentProduct.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(currentProduct.ratings?.average || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {currentProduct.ratings?.average?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-600">
                    ({currentProduct.ratings?.count || 0} reviews)
                  </span>
                </div>
                {currentProduct.isFeatured && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary-600">
                ₹{currentProduct.price}
              </span>
              {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{currentProduct.originalPrice}
                </span>
              )}
            </div>

            <div className="text-gray-600">
              <p className="text-sm mb-2">
                <span className="font-medium">SKU:</span> {currentProduct.sku}
              </p>
              <p className="text-sm mb-2">
                <span className="font-medium">Category:</span> {currentProduct.category?.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Stock:</span> {currentProduct.stock > 0 ? `${currentProduct.stock} available` : 'Out of stock'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{currentProduct.description}</p>
              </div>

              {currentProduct.material && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Material</h3>
                  <p className="text-gray-600">{currentProduct.material}</p>
                </div>
              )}

              {currentProduct.color && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Color</h3>
                  <p className="text-gray-600">{currentProduct.color}</p>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= currentProduct.stock}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="px-4"
                >
                  <HeartIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {currentProduct.description}
            </p>
            {currentProduct.shortDescription && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h4>
                <p className="text-gray-700">{currentProduct.shortDescription}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(currentProduct.ratings?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentProduct.ratings?.average?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {currentProduct.ratings?.count || 0} reviews
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          {isAuthenticated && canWriteReview && (
            <div className="mb-8">
              {!showReviewForm ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Share Your Experience
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You purchased this product and it has been delivered. Help other customers by writing a review.
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* Message for users who can't write reviews */}
          {isAuthenticated && !canWriteReview && (
            <div className="mb-8">
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Write a Review
                </h3>
                <p className="text-gray-600 mb-4">
                  You can write a review for this product after purchasing it and receiving your order.
                </p>
                <p className="text-sm text-gray-500">
                  Only customers who have received delivered orders can write reviews.
                </p>
              </div>
            </div>
          )}

          {/* Message for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mb-8">
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Write a Review
                </h3>
                <p className="text-gray-600 mb-4">
                  Please log in to write a review for this product.
                </p>
                <Link to="/login">
                  <Button>Log In</Button>
                </Link>
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

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
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
      </div>
    </div>
  );
};

export default ProductDetail;
