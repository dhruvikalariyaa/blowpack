import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon
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

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Products - Blow Pack Plastic Industries</title>
        <meta name="description" content="Browse our complete collection of high-quality plastic products including bottles, containers, and custom solutions." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-full lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories?.map((category) => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category._id}
                        onChange={() => handleFilterChange('category', category._id)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Other Filters */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full mt-6"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <LoadingSpinner size="xl" className="min-h-96" />
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Showing {pagination.totalItems} products
                  </p>
                  <div className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products?.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative">
                        <img
                          src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex flex-col space-y-2">
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                          >
                            <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
                          </button>
                        </div>
                        {product.isFeatured && (
                          <div className="absolute top-2 left-2">
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
                          <span className="text-sm text-gray-500">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/products/${product._id}`}
                            className="flex-1 text-center py-2 px-4 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-md transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors text-sm font-medium"
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
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
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
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
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
