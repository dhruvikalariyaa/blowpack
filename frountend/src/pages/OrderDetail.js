import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import {
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.ORDERS + `/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const result = await response.json();
      setOrder(result.data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Helmet>
        <title>Order #{order.orderNumber} - Blow Pack Plastic Industries</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <TruckIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                  <p className="text-gray-600 text-xs flex items-center space-x-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>Placed on {formatDate(order.createdAt)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white rounded-md shadow-sm">
                  {getStatusIcon(order.orderStatus)}
                </div>
                <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${getStatusColor(order.orderStatus)} shadow-sm`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Order Items</span>
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-product.svg'}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg shadow-sm border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs text-gray-600">× ₹{item.price}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Order Summary</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Subtotal</span>
                  <span className="font-semibold text-gray-900 text-sm">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Shipping</span>
                  <span className="font-semibold text-green-600 text-sm">
                    {order.shippingCharges === 0 ? 'Free' : `₹${order.shippingCharges}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 text-green-600">
                    <span className="text-sm">Discount</span>
                    <span className="font-semibold text-sm">-₹{order.discount}</span>
                  </div>
                )}
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address & Payment Information */}
            <div className="grid grid-cols-1 gap-4">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Shipping Address</span>
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                    <p className="text-gray-700 flex items-center space-x-1">
                      <span className="text-gray-500">📞</span>
                      <span>{order.shippingAddress.phone}</span>
                    </p>
                    <p className="text-gray-700 mt-2">{order.shippingAddress.address}</p>
                    <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p className="text-gray-700">{order.shippingAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Payment Information</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600 text-sm">Payment Method</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 text-sm">Payment Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Tracking Information</span>
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Tracking Number</span>
                      <span className="text-gray-900 font-mono font-semibold bg-green-200 px-2 py-1 rounded text-xs">{order.trackingNumber}</span>
                    </div>
                    {order.shippedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs">Shipped On</span>
                        <span className="text-gray-900 text-xs font-medium">{formatDate(order.shippedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span>Order Notes</span>
                </h3>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <p className="text-gray-700 text-xs">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Review Section */}
            {(order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Rate Your Experience</span>
                </h3>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <p className="text-gray-700 text-xs mb-3">
                    How was your experience with this order? Your feedback helps us improve our service.
                  </p>
                  <Link to={`/orders/${order._id}/review`}>
                    <button className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
                      <StarIcon className="h-4 w-4" />
                      <span>Write Review</span>
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;