import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { fetchUserOrders } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();
  const { userOrders, loading, error } = useSelector(state => state.orders);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
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
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = userOrders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.orderStatus === filterStatus;
  });

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>My Orders - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === 'processing'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === 'shipped'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterStatus === 'delivered'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{order.totalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.name}<br />
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                          Phone: {order.shippingAddress.phone}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Order Summary</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{order.subtotal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span>₹{order.shippingCharges}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.orderStatus === 'shipped' && order.trackingNumber && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TruckIcon className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Your order has been shipped!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Tracking Number: <span className="font-mono font-medium">{order.trackingNumber}</span>
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Shipped on: {formatDate(order.shippedAt)}
                        </p>
                      </div>
                    )}

                    {/* Delivered Info */}
                    {order.orderStatus === 'delivered' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Your order has been delivered!</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Delivered on: {formatDate(order.deliveredAt)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                      <Link to={`/orders/${order._id}`}>
                        <Button variant="outline" className="flex items-center space-x-2">
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </Button>
                      </Link>
                      {order.orderStatus === 'delivered' && (
                        <Link to={`/orders/${order._id}/review`}>
                          <Button className="flex items-center space-x-2">
                            <StarIcon className="h-4 w-4" />
                            <span>Write Review</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filterStatus} orders found.`
              }
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
