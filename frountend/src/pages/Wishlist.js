import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { fetchWishlist, removeFromWishlist, moveToCart } from '../store/slices/wishlistSlice';
import { addToCart as addToCartAction } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId));
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await dispatch(moveToCart(productId));
    } catch (error) {
      toast.error('Failed to move to cart');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCartAction({ productId, quantity: 1 }));
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist.</p>
          <Link to="/login">
            <Button>Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Your Wishlist - Packwell Plastic Industries</title>
        </Helmet>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Save items you love for later by adding them to your wishlist.</p>
            <Link to="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Your Wishlist - Packwell Plastic Industries</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <span className="text-gray-600">{wishlist.products.length} items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
                <img
                  src={product.images?.[0]?.url || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
                    title="Remove from wishlist"
                  >
                    <TrashIcon className="h-4 w-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
                {product.isFeatured && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.ratings?.average || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.ratings?.count || 0})
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 text-center py-2 px-4 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-md transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors text-sm font-medium"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveToCart(product._id)}
                    className="w-full"
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
