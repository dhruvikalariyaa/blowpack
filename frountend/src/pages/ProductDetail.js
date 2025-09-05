import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, relatedProducts, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = React.useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id]);

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
                src={currentProduct.images?.[0]?.url || '/placeholder-product.jpg'}
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
                <span className="text-gray-600">
                  ({currentProduct.ratings?.count || 0} reviews)
                </span>
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

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.jpg'}
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
