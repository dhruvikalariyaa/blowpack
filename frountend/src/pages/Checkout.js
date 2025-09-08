import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, fetchCart } from '../store/slices/cartSlice';
import { API_ENDPOINTS } from '../config/api';
import { useApi, useRateLimitHandler } from '../hooks/useApi';
import ErrorAlert from '../components/common/ErrorAlert';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector(state => state.cart);
  const items = cart?.items || [];
  const totalAmount = cart?.totalPrice || 0;
  const { user } = useSelector(state => state.auth);

  const { loading, error, makeRequest, clearError } = useApi();
  const { isRateLimited, retryAfter, handleRateLimit, clearRateLimit } = useRateLimitHandler();
  
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    console.log('Checkout useEffect - user:', user, 'items:', items, 'cart:', cart);
    
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login?redirect=/checkout');
      return;
    }

    // Fetch cart if not loaded
    if (!cart || !cart.items) {
      console.log('Cart not loaded, fetching cart');
      dispatch(fetchCart());
      return;
    }

    if (!items || items.length === 0) {
      console.log('No items in cart, redirecting to cart');
      navigate('/cart');
      return;
    }
    
    console.log('Checkout page loaded successfully');
  }, [user, items, cart, navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const orderData = {
        items: (items || []).map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || ''
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const result = await makeRequest(async () => {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.message || 'Failed to place order');
          error.response = response;
          throw error;
        }

        return response.json();
      }, {
        onError: (error) => {
          handleRateLimit(error);
        }
      });
      
      // Clear cart
      dispatch(clearCart());
      
      // Set success state
      setSuccess(true);
      setOrderNumber(result.data.order.orderNumber);
      
      // Redirect to order confirmation after 3 seconds
      setTimeout(() => {
        navigate(`/orders/${result.data.order._id}`);
      }, 3000);

    } catch (err) {
      // Error is already handled by useApi hook
      console.error('Order submission error:', err);
    }
  };

  const calculateShipping = () => {
    return (totalAmount || 0) >= 500 ? 0 : 50;
  };

  const shippingCharges = calculateShipping();
  const finalTotal = (totalAmount || 0) + shippingCharges;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Order Confirmed - Blow Pack Plastic Industries</title>
        </Helmet>
        <div className="max-w-md mx-auto text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Your order has been placed successfully.
          </p>
          <p className="text-lg font-semibold text-blue-600 mb-4">
            Order Number: {orderNumber}
          </p>
          <p className="text-sm text-gray-500">
            You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to order details...
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - Blow Pack Plastic Industries</title>
      </Helmet>
      
      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4">
        <p><strong>Debug Info:</strong> User: {user ? 'Logged in' : 'Not logged in'}, Items: {items.length}, Cart: {cart ? 'Loaded' : 'Not loaded'}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

            <ErrorAlert
              error={error}
              onRetry={() => {
                clearError();
                clearRateLimit();
                handleSubmit({ preventDefault: () => {} });
              }}
              onDismiss={clearError}
              isRateLimited={isRateLimited}
              className="mb-6"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Pincode"
                    />
                    {formErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Cash on Delivery</span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Online Payment (Coming Soon)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isRateLimited}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 
                 isRateLimited ? 'Please Wait...' : 
                 `Place Order - ₹${finalTotal}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              {items && items.length > 0 ? items.map((item) => (
                <div key={item.product._id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder-product.svg'}
                      alt={item.product.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No items in cart</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{totalAmount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {shippingCharges === 0 ? 'Free' : `₹${shippingCharges}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">₹{finalTotal}</span>
              </div>
            </div>

            {shippingCharges === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  🎉 You qualify for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;