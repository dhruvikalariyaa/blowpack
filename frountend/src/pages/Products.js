import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  fetchProducts, 
  setFilters, 
  clearFilters,
  addToCart,
  addToWishlist
} from '../store/slices/productSlice';
import { addToCart as addToCartAction } from '../store/slices/cartSlice';
import { addToWishlist as addToWishlistAction } from '../store/slices/wishlistSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    pagination, 
    filters, 
    loading 
  } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Only refresh when filters change
  // No automatic refresh - only manual refresh button

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    setShowSuggestions(false);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      // Filter products for suggestions based on current products
      const filteredSuggestions = products?.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5) || [];
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    dispatch(setFilters({ search: product.name }));
    setShowSuggestions(false);
    // Automatically trigger search
    dispatch(fetchProducts({ ...filters, search: product.name }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await dispatch(addToCartAction({ productId: product._id, quantity: 1 }));
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await dispatch(addToWishlistAction(product._id));
      toast.success('Product added to wishlist');
    } catch (error) {
      toast.error('Failed to add product to wishlist');
    }
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await dispatch(fetchProducts(filters));
      toast.success('Products refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Helmet>
        <title>Products - Blow Pack Plastic Industries</title>
        <meta name="description" content="Browse our complete collection of high-quality plastic products including bottles, containers, and custom solutions." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        

        {/* Search Section */}
        <div className="mb-6">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                  className="w-full pl-12 pr-40 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 text-base bg-white shadow-sm hover:shadow-md transition-all duration-300"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                
                {/* Right Side Buttons Container */}
                <div className="absolute right-2 top-1.5 flex items-center gap-2">
                  {/* Clear Button */}
                  {(searchTerm || filters.search) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        dispatch(clearFilters());
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200"
                    >
                      Clear
                    </button>
                  )}
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((product) => (
                  <div
                    key={product._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchTerm(product.name);
                      dispatch(setFilters({ search: product.name }));
                      setShowSuggestions(false);
                      navigate(`/products/${product._id}`);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg'}
                        alt={product.name}
                        className="w-10 h-10 object-contain bg-white rounded-md border border-gray-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">₹{product.price}</p>
                </div>
              </div>
                  </div>
                ))}
              </div>
            )}
              </div>
              </div>


        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <LoadingSpinner size="xl" />
          </div>
        ) : products && products.length > 0 ? (
          <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products?.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                  <Link to={`/products/${product._id}`} className="block flex-1 flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg'}
                          alt={product.name}
                        className="w-full h-full object-contain bg-white p-2"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                        />
                      
                      {/* Wishlist Button */}
                          <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToWishlist(product);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-110"
                      >
                        <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                          </button>
                      
                      {/* Featured Badge */}
                        {product.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Featured
                            </span>
                          </div>
                        )}

                      </div>

                    {/* Product Info */}
                      <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[3.5rem] flex items-start">
                          {product.name}
                        </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.ratings?.average || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            ({product.ratings?.count || 0})
                          </span>
                        </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary-600">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                      </div>
                        </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0 mt-auto">
                        <div className="flex space-x-2">
                          <Link
                            to={`/products/${product._id}`}
                        className="flex-1 text-center py-2.5 px-4 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                        className="px-4 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-all duration-200 text-sm font-medium hover:scale-105"
                          >
                        <ShoppingCartIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            pagination.currentPage === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
        ) : (
          /* No Products Found */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
              {/* Icon */}
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Products Found
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-6">
                {filters.search ? 
                  `We couldn't find any products matching "${filters.search}". Try adjusting your search terms.` :
                  'No products are currently available. Please check back later.'
                }
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {filters.search && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      dispatch(clearFilters());
                      setShowSuggestions(false);
                    }}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => dispatch(fetchProducts({}))}
                  className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-medium transition-colors duration-200"
                >
                  View All Products
                </button>
              </div>
              
              {/* Suggestions */}
              {filters.search && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Search Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Try different keywords</li>
                    <li>• Use more general terms</li>
                    <li>• Browse categories instead</li>
                  </ul>
                </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Products;
