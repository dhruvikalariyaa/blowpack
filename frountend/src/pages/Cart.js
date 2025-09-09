import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Debug logging for cart data
  useEffect(() => {
    if (cart && cart.items) {
      console.log('🛒 Frontend cart data:', {
        itemsCount: cart.items.length,
        items: cart.items.map(item => ({
          name: item.product?.name,
          isActive: item.product?.isActive,
          quantity: item.quantity
        }))
      });
    }
  }, [cart]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    console.log('🔄 Updating quantity:', { productId, newQuantity });
    
    try {
      const result = await dispatch(updateCartItem({ productId, quantity: newQuantity }));
      console.log('✅ Quantity update result:', result);
      
      if (result.type.endsWith('/rejected')) {
        toast.error('Failed to update quantity');
      } else {
        toast.success('Quantity updated successfully');
      }
    } catch (error) {
      console.error('❌ Quantity update error:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId));
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart());
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleRefreshCart = async () => {
    try {
      // Clear any cached data
      localStorage.removeItem('cart');
      await dispatch(fetchCart());
      toast.success('Cart refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Your Cart - Blow Pack Plastic Industries</title>
        </Helmet>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Your Cart - Packwell Plastic Industries</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshCart}
              className="text-sm"
            >
              Refresh Cart
            </Button>
            <Button variant="outline" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              // Debug logging
              console.log('🔍 Cart item debug:', {
                name: item.product?.name,
                isActive: item.product?.isActive,
                isActiveType: typeof item.product?.isActive,
              });
              
              // Check if product is active (handle undefined case)
              const isProductActive = item.product?.isActive === true;
              
              return (
              <div key={item.product._id} className={`bg-white rounded-lg shadow-sm border p-6 ${
                !isProductActive ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}>
                {!isProductActive && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm font-medium">
                      ⚠️ This product is no longer available and will be removed from your cart.
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder-product.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.product.category?.name}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-primary-600">
                        ₹{item.price}
                      </span>
                      {!isProductActive && (
                        <span className="text-sm text-red-600 font-medium">
                          No longer available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1 || !isProductActive}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity >= 1) {
                            handleQuantityChange(item.product._id, newQuantity);
                          }
                        }}
                        onBlur={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity < 1) {
                            handleQuantityChange(item.product._id, 1);
                          }
                        }}
                        className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={!isProductActive}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={!isProductActive}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">₹{cart.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart.totalPrice >= 500 ? 'Free' : '₹50'}
                  </span>
                </div>
                {cart.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{cart.totalDiscount}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{cart.totalPrice + (cart.totalPrice >= 500 ? 0 : 50) - cart.totalDiscount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Link to="/checkout" className="block" onClick={() => console.log('Proceed to Checkout clicked')}>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={cart.items.some(item => item.product?.isActive !== true)}
                  >
                    {cart.items.some(item => item.product?.isActive !== true) 
                      ? 'Remove unavailable items to checkout' 
                      : 'Proceed to Checkout'
                    }
                  </Button>
                </Link>
                <Link to="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {cart.totalPrice < 500 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    Add ₹{500 - cart.totalPrice} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
