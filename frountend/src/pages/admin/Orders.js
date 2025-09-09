import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    completed: 0,
    total: 0
  });
  const [overallStats, setOverallStats] = useState({
    pending: 0,
    completed: 0,
    total: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchOverallStats();
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const calculateOrderStats = (ordersData) => {
    const stats = {
      pending: 0,
      completed: 0,
      total: ordersData.length
    };

    ordersData.forEach(order => {
      if (order.orderStatus === 'pending') {
        stats.pending++;
      } else if (order.orderStatus === 'completed') {
        stats.completed++;
      }
    });

    return stats;
  };

  const fetchOverallStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch overall statistics');
      }

      const data = await response.json();
      
      // Process the ordersByStatus array to get counts
      const statusCounts = {};
      data.data.ordersByStatus.forEach(item => {
        statusCounts[item._id] = item.count;
      });

      setOverallStats({
        pending: statusCounts.pending || 0,
        completed: statusCounts.completed || 0,
        total: data.data.totalOrders || 0
      });
    } catch (err) {
      console.error('Error fetching overall stats:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 6,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentStatusFilter !== 'all' && { paymentStatus: paymentStatusFilter })
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data.orders);
      setTotalPages(data.data.pagination.totalPages);
      setTotalOrders(data.data.pagination.totalItems);
      
      // Calculate order statistics
      const stats = calculateOrderStats(data.data.orders);
      setOrderStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const result = await response.json();
      console.log('✅ Order status updated successfully:', result);
      
      // Show success message
      const statusMessages = {
        'confirmed': 'Order confirmed successfully! Customer has been notified.',
        'processing': 'Order is now being processed!',
        'shipped': 'Order has been shipped! Customer will receive tracking details.',
        'delivered': 'Order marked as delivered! Customer has been notified.',
        'completed': 'Order completed successfully!',
        'cancelled': 'Order cancelled successfully! Customer has been notified.'
      };
      
      alert(statusMessages[newStatus] || `Order status updated to ${newStatus} successfully!`);
      
      fetchOrders();
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      setError(err.message);
      alert(`Error updating order status: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Orders - Packwell Plastic Industries</title>
      </Helmet>
      
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
           
          </div>
        </div>

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Pending Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{overallStats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{overallStats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{overallStats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-3 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"/>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentStatusFilter('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">ID: {order._id.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                    <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4 flex-1">
                {/* Customer Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{order.user?.name}</div>
                    <div className="text-gray-500">{order.user?.email}</div>
                    <div className="text-gray-500">{order.shippingAddress?.phone}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                  <div className="text-sm text-gray-900">
                    {order.items?.length || 0} items
                    {order.items && order.items.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index}>
                            {item.product?.name} (Qty: {item.quantity})
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div>+{order.items.length - 2} more items</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="px-4 py-3 bg-gray-50 rounded-b-lg mt-auto">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="inline-flex items-center px-2 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View
                  </button>

                  <div className="flex space-x-1">
                    {/* Status-specific action buttons */}
                    {order.orderStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500"
                          title="Confirm Order"
                        >
                          <CheckIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              updateOrderStatus(order._id, 'cancelled');
                            }
                          }}
                          className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                          title="Cancel Order"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    
                    {order.orderStatus === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'processing')}
                          className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                          title="Start Processing"
                        >
                          <CheckIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              updateOrderStatus(order._id, 'cancelled');
                            }
                          }}
                          className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                          title="Cancel Order"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    
                    {order.orderStatus === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                        className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-purple-500"
                        title="Mark as Shipped"
                      >
                        <TruckIcon className="h-3 w-3" />
                      </button>
                    )}
                    
                    {order.orderStatus === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500"
                        title="Mark as Delivered"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </button>
                    )}
                    
                    {order.orderStatus === 'delivered' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                        className="inline-flex items-center justify-center p-1.5 border border-transparent rounded text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-500"
                        title="Mark as Completed"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </button>
                    )}
                    
                    {/* Show status for completed/cancelled orders */}
                    {(order.orderStatus === 'completed' || order.orderStatus === 'cancelled') && (
                      <span className="inline-flex items-center px-1.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {order.orderStatus === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg shadow-sm mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{orders.length}</span> of{' '}
                  <span className="font-medium">{totalOrders || 0}</span> orders
                </p>
                <p className="text-xs text-gray-500">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current page
                    const shouldShow = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!shouldShow) {
                      // Show ellipsis for gaps
                      if (page === 2 && currentPage > 4) {
                        return (
                          <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                      if (page === totalPages - 1 && currentPage < totalPages - 3) {
                        return (
                          <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="bg-blue-100 px-6 py-4 text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber}</h2>
                    <p className="text-gray-900 text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-blue-300 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Status</h3>
                        <p className="text-lg font-bold text-gray-700 mt-1">{selectedOrder.orderStatus}</p>
                      </div>
                      <div className="p-2 rounded-full bg-blue-100">
                        <CheckIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Status</h3>
                        <p className="text-lg font-bold text-gray-700 mt-1">{selectedOrder.paymentStatus}</p>
                      </div>
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Order Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium text-gray-700">{selectedOrder.user?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-600">{selectedOrder.user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-600">{selectedOrder.shippingAddress?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Shipping Address</h3>
                    <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Name: </span><span className="text-gray-700">{selectedOrder.shippingAddress?.name}</span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-700">Address: </span><span className="text-gray-700">{selectedOrder.shippingAddress?.address}</span>
                      </div>
                      <div className="flex justify-between">
                      <span className=" text-gray-700">City: </span><span className="text-gray-700">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</span  >
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Order Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-pink-200">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                          <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index} className="hover:bg-pink-100">
                            <td className="py-2 px-3 text-gray-700">{item.product?.name}</td>
                            <td className="py-2 px-3 text-right text-gray-600">₹{item.price}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-200 text-gray-600">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-gray-700">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600">Total Amount</h3>
                      <p className="text-gray-500 text-xs">Including all taxes and fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-700">₹{selectedOrder.totalAmount}</div>
                      <div className="text-gray-500 text-xs">Final Amount</div>
                    </div>
                  </div>
                </div>
              

                {/* Order Timeline */}
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Order Placed</p>
                        <p className="text-gray-500 text-xs">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                    {selectedOrder.orderStatus !== 'pending' && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order Confirmed</p>
                          <p className="text-gray-500 text-xs">Processing...</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.orderStatus === 'shipped' && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order Shipped</p>
                          <p className="text-gray-500 text-xs">On the way</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.orderStatus === 'delivered' && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order Delivered</p>
                          <p className="text-gray-500 text-xs">Completed</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
