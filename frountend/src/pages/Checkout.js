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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    console.log('Checkout useEffect - user:', user, 'items:', items, 'cart:', cart, 'success:', success);
    
    // Don't redirect if order is successful
    if (success) {
      return;
    }
    
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
    
    // Fetch saved addresses
    fetchSavedAddresses();
    
    console.log('Checkout page loaded successfully');
  }, [user, items, cart, navigate, dispatch, success]);

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.data.addresses || []);
        
        // Auto-fill with default address if available
        const defaultAddress = data.data.addresses?.find(addr => addr.isDefault);
        if (defaultAddress) {
          setFormData(prev => ({
            ...prev,
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode
          }));
          setSelectedAddressId(defaultAddress._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

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

  // Handle address selection
  const handleAddressSelect = (address) => {
    setFormData(prev => ({
      ...prev,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    }));
    setSelectedAddressId(address._id);
    setShowAddressForm(false);
  };

  // Save current address
  const saveCurrentAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Validate required fields before saving
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
        alert('Please fill all required fields before saving address');
        return;
      }

      // Validate phone number format
      if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      // Validate pincode format
      if (!/^\d{6}$/.test(formData.pincode)) {
        alert('Please enter a valid 6-digit pincode');
        return;
      }

      // Validate address length
      if (formData.address.length < 10) {
        alert('Address must be at least 10 characters long');
        return;
      }

      const addressData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        isDefault: savedAddresses.length === 0 // Set as default if it's the first address
      };

      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.data.addresses);
        alert('Address saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Address save error:', errorData);
        
        // Show specific validation errors
        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          alert(`Validation Error:\n${errorMessages}`);
        } else {
          alert(errorData.message || 'Failed to save address');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address');
    }
  };

  // Pincode lookup function
  const lookupPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    
    setPincodeLoading(true);
    try {
      // Using multiple APIs for better reliability
      const apis = [
        `https://api.postalpincode.in/pincode/${pincode}`,
        `https://pinlookup.in/api/pincode?pincode=${pincode}`
      ];

      let locationData = null;
      
      // Try first API
      try {
        const response = await fetch(apis[0]);
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
            const postOffice = data[0].PostOffice[0];
            locationData = {
              city: postOffice.District,
              state: postOffice.State
            };
          }
        }
      } catch (error) {
        console.log('First API failed, trying second...');
      }

      // If first API failed, try second API
      if (!locationData) {
        try {
          const response = await fetch(apis[1]);
          if (response.ok) {
            const data = await response.json();
            if (data && data.data) {
              locationData = {
                city: data.data.district_name,
                state: data.data.state_name
              };
            }
          }
        } catch (error) {
          console.log('Second API also failed');
        }
      }

      // Update form data if location found
      if (locationData) {
        setFormData(prev => ({
          ...prev,
          city: locationData.city,
          state: locationData.state
        }));
        
        // Show subtle success feedback
        setPincodeMessage(`✅ ${locationData.city}, ${locationData.state}`);
        setTimeout(() => setPincodeMessage(''), 3000); // Clear after 3 seconds
      } else {
        // Fallback: show subtle error feedback
        setPincodeMessage('❌ Pincode not found');
        setTimeout(() => setPincodeMessage(''), 3000); // Clear after 3 seconds
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      // No popup - just log the error
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errors.phone = 'Please provide a valid 10-digit phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10 || formData.address.trim().length > 200) {
      errors.address = 'Address must be between 10 and 200 characters';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length < 2 || formData.city.trim().length > 50) {
      errors.city = 'City must be between 2 and 50 characters';
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    } else if (formData.state.trim().length < 2 || formData.state.trim().length > 50) {
      errors.state = 'State must be between 2 and 50 characters';
    }

    // Pincode validation
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Please provide a valid 6-digit pincode';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show confirmation modal instead of directly placing order
    setShowConfirmModal(true);
  };

  const confirmPlaceOrder = async () => {
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
      
      // Save address if not already saved
      if (!selectedAddressId && formData.name && formData.address) {
        try {
          await saveCurrentAddress();
        } catch (error) {
          console.error('Error saving address after order:', error);
        }
      }

      // Clear cart
      dispatch(clearCart());
      
      // Set success state
      setSuccess(true);
      setOrderNumber(result.data.order.orderNumber);
      
      // Close confirmation modal
      setShowConfirmModal(false);

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

  // Show success page first (highest priority)
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Helmet>
          <title>Order Confirmed - Blow Pack Plastic Industries</title>
        </Helmet>
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-green-200">
          {/* Success Animation */}
          <div className="relative mb-6">
            <CheckCircleIcon className="mx-auto h-20 w-20 text-green-500 mb-4 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 bg-green-100 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your order has been placed successfully and is being processed.
          </p>
          
          {/* Order Number */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-600 font-medium mb-1">Order Number</p>
            <p className="text-2xl font-bold text-blue-700 font-mono">
              {orderNumber}
            </p>
          </div>
          
          {/* Next Steps */}
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <span className="text-gray-700">Order confirmation email sent</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">⏳</span>
              </div>
              <span className="text-gray-700">Processing your order</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">📦</span>
              </div>
              <span className="text-gray-500">Will be shipped within 2-3 business days</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            You can track your order status in the "My Orders" section.
          </p>
        </div>
      </div>
    );
  }

  // Loading state (only show if not successful)
  if (loading && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Processing Your Order
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your order...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - Blow Pack Plastic Industries</title>
      </Helmet>
      

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAddressForm ? 'Hide Saved Addresses' : 'Use Saved Address'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses */}
                {showAddressForm && savedAddresses.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Select from saved addresses:</h4>
                    <div className="space-y-2">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAddressSelect(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{address.name}</span>
                                {address.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                              <p className="text-sm text-gray-600">
                                {address.address}, {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                            <div className="ml-2">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddressId === address._id}
                                onChange={() => handleAddressSelect(address)}
                                className="text-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Or enter new address below
                      </button>
                    </div>
                  </div>
                )}
                
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
                    <div className="relative">
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
                      {pincodeLoading && formData.city && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-green-500 text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <div className="relative">
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
                      {pincodeLoading && formData.state && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-green-500 text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Trigger lookup when pincode is 6 digits
                          if (e.target.value.length === 6) {
                            lookupPincode(e.target.value);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.pincode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                      />
                      {pincodeLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    {formErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pincode}</p>
                    )}
                    {pincodeMessage && (
                      <p className={`mt-1 text-xs ${pincodeMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {pincodeMessage}
                      </p>
                    )}
                    {!pincodeMessage && (
                      <p className="mt-1 text-xs text-gray-500">
                        💡 City and state will auto-fill when you enter pincode
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Address Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={saveCurrentAddress}
                    className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-100 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 8a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 3a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 3a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"/>
                    </svg>
                    Save this address for future use
                  </button>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full transform animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Header */}
            <div className="relative px-8 pt-8 pb-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Confirm Your Order
              </h3>
              
              <p className="text-gray-600 text-center text-base leading-relaxed">
                Please review your order details before proceeding with the payment
              </p>
            </div>
            
            {/* Order Summary */}
            <div className="px-8 pb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Order Summary</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">₹{finalTotal}</div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Items ({items.length})</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Shipping</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {shippingCharges === 0 ? 'Free' : `₹${shippingCharges}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="px-8 pb-8">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPlaceOrder}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;