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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Helmet>
        <title>My Orders - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm">
              <TruckIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 text-xs">Track and manage your orders</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {/* Total Orders Card */}
            <div className="bg-white rounded-md p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-0.5">{userOrders.length}</div>
              <div className="text-gray-500 text-xs font-medium">Total</div>
            </div>
            
            {/* Delivered Card */}
            <div className="bg-white rounded-md p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-0.5">
                {userOrders.filter(o => o.orderStatus === 'delivered').length}
              </div>
              <div className="text-gray-500 text-xs font-medium">Delivered</div>
            </div>
            
            {/* In Progress Card */}
            <div className="bg-white rounded-md p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-0.5">
                {userOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.orderStatus)).length}
              </div>
              <div className="text-gray-500 text-xs font-medium">In Progress</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Filter Orders</span>
              </h3>
              <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-500">
                  {filteredOrders.length} of {userOrders.length} orders
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 text-sm font-medium bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                {/* Order Header */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white rounded-md shadow-sm">
                          {getStatusIcon(order.orderStatus)}
                        </div>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>Placed on {formatDate(order.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Order Items</span>
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                          <img
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600 flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">
                              Qty: {item.quantity}
                            </span>
                            <span>× ₹{item.price}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Shipping Address</span>
                        </h5>
                        <div className="space-y-1 text-xs text-gray-700">
                          <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                          <p className="flex items-center space-x-1">
                            <span className="text-gray-500">📞</span>
                            <span>{order.shippingAddress.phone}</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Order Summary</span>
                        </h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-green-200">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">₹{order.subtotal}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-green-200">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-semibold text-green-600">
                              {order.shippingCharges === 0 ? 'Free' : `₹${order.shippingCharges}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-sm font-bold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-green-600">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.orderStatus === 'shipped' && order.trackingNumber && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-green-500 rounded-md">
                            <TruckIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-green-800 text-sm">Your order has been shipped!</span>
                            <p className="text-xs text-green-700 mt-1">
                              Tracking: <span className="font-mono font-bold bg-green-200 px-1.5 py-0.5 rounded text-xs">{order.trackingNumber}</span>
                            </p>
                            <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>Shipped: {formatDate(order.shippedAt)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivered Info */}
                    {order.orderStatus === 'delivered' && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-green-500 rounded-md">
                            <CheckCircleIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-green-800 text-sm">Your order has been delivered!</span>
                            <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>Delivered: {formatDate(order.deliveredAt)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end space-x-3">
                      <Link to={`/orders/${order._id}`}>
                        <button className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </Link>
                      {(order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
                        <Link to={`/orders/${order._id}/review`}>
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1">
                            <StarIcon className="h-4 w-4" />
                            <span>Write Review</span>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TruckIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                : `No ${filterStatus} orders found. Try selecting a different filter.`
              }
            </p>
            <Link to="/products">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
