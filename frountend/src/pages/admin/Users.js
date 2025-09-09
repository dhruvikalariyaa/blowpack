import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.users);
      setTotalPages(data.data.pagination.totalPages);
      setTotalUsers(data.data.pagination.totalItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
        <title>Admin Users - Packwell Plastic Industries</title>
      </Helmet>
      
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-3 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                 <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage && user.profileImage.url ? (
                            <img
                              src={user.profileImage.url}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${user.profileImage && user.profileImage.url ? 'hidden' : 'flex'}`}
                            style={{ display: (user.profileImage && user.profileImage.url) ? 'none' : 'flex' }}
                          >
                            <span className="text-gray-600 font-medium text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => toggleUserStatus(user._id, !user.isActive)}
                          className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {user.isActive ? (
                            <UserMinusIcon className="h-4 w-4" />
                          ) : (
                            <UserPlusIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Pagination */}
        {totalPages >= 1 && (
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
                  Showing <span className="font-medium">{users.length}</span> of{' '}
                  <span className="font-medium">{totalUsers || 0}</span> users
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
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="bg-blue-100 px-6 py-4 text-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">User Details - {selectedUser.name}</h2>
                    <p className="text-gray-900 text-sm">ID: {selectedUser._id.slice(-8)} • Joined: {formatDate(selectedUser.createdAt)}</p>
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

                {/* User Profile & Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Profile Picture & Basic Info */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Profile Information</h3>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {selectedUser.profileImage && selectedUser.profileImage.url ? (
                          <img
                            src={selectedUser.profileImage.url}
                            alt={selectedUser.name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-purple-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-16 w-16 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-200 ${selectedUser.profileImage && selectedUser.profileImage.url ? 'hidden' : 'flex'}`}
                          style={{ display: (selectedUser.profileImage && selectedUser.profileImage.url) ? 'none' : 'flex' }}
                        >
                          <span className="text-purple-600 font-bold text-xl">
                            {selectedUser.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700">{selectedUser.name}</h4>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium text-gray-700">{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email Verified:</span>
                        <span className={`font-medium ${selectedUser.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Role:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.isActive)}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">User ID:</span>
                        <span className="text-gray-700 text-xs font-mono">{selectedUser._id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Joined:</span>
                        <span className="text-gray-700 text-sm">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Addresses ({selectedUser.addresses.length})</h3>
                    <div className="space-y-3">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-pink-100">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-700">{address.name}</span>
                                {address.isDefault && (
                                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">{address.phone}</p>
                              <p className="text-gray-600">{address.address}</p>
                              <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Actions */}
                
                 <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => toggleUserStatus(selectedUser._id, !selectedUser.isActive)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedUser.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                      }`}
                    >
                      {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                  </div>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
