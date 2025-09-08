import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if we have cached data
    const cachedStats = localStorage.getItem('adminDashboardStats');
    const cacheTime = localStorage.getItem('adminDashboardCacheTime');
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    if (cachedStats && cacheTime && (now - parseInt(cacheTime)) < cacheExpiry) {
      setStats(JSON.parse(cachedStats));
      setLoading(false);
    } else {
      fetchDashboardStats();
    }
  }, []);

  const fetchDashboardStats = async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Add delay for retry attempts
      if (retryAttempt > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryAttempt) * 1000));
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 429) {
        if (retryAttempt < 3) {
          setRetryCount(retryAttempt + 1);
          setTimeout(() => fetchDashboardStats(retryAttempt + 1), 2000);
          return;
        }
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch dashboard stats`);
      }

      const data = await response.json();
      setStats(data.data);
      setRetryCount(0); // Reset retry count on success
      
      // Cache the data
      localStorage.setItem('adminDashboardStats', JSON.stringify(data.data));
      localStorage.setItem('adminDashboardCacheTime', Date.now().toString());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchDashboardStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Dashboard Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600'
    };

    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  {change && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {changeType === 'increase' ? (
                        <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                      )}
                      <span className="sr-only">{changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                      {change}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Dashboard - Packwell Plastic Industries</title>
      </Helmet>
      
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={stats?.products?.total || 0}
            icon={ShoppingBagIcon}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats?.orders?.total || 0}
            icon={ChartBarIcon}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.revenue?.total?.toLocaleString() || 0}`}
            icon={CurrencyDollarIcon}
            color="yellow"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Active Products"
            value={stats?.products?.active || 0}
            icon={ShoppingBagIcon}
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={stats?.orders?.pending || 0}
            icon={ChartBarIcon}
            color="red"
          />
          <StatCard
            title="Out of Stock"
            value={stats?.products?.outOfStock || 0}
            icon={ShoppingBagIcon}
            color="red"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats?.revenue?.monthly?.toLocaleString() || 0}`}
            icon={CurrencyDollarIcon}
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{order.totalAmount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                          order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/orders"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View all orders →
                </Link>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {stats?.topSellingProducts?.length > 0 ? (
                  stats.topSellingProducts.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">₹{item.product?.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.totalSold} sold</p>
                        <p className="text-sm text-gray-500">₹{item.totalRevenue}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales data available</p>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/products"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Manage products →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/products"
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      Manage Products
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add, edit, and manage products
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="group relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                      Manage Orders
                    </h3>
                    <p className="text-sm text-gray-600">
                      View and update order statuses
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                      Manage Users
                    </h3>
                    <p className="text-sm text-gray-600">
                      View registered users
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/categories"
                className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600">
                      Manage Categories
                    </h3>
                    <p className="text-sm text-gray-600">
                      Organize product categories
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
