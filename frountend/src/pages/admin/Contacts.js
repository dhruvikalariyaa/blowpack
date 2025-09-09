import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  EyeIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    new: <ExclamationTriangleIcon className="h-4 w-4" />,
    in_progress: <ClockIcon className="h-4 w-4" />,
    resolved: <CheckCircleIcon className="h-4 w-4" />,
    closed: <CheckCircleIcon className="h-4 w-4" />
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`${API_ENDPOINTS.CONTACT}?${params}`);
      
      if (response.data.success) {
        setContacts(response.data.data.contacts);
        setPagination(response.data.data.pagination);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = async (contactId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.CONTACT}/${contactId}`);
      if (response.data.success) {
        setSelectedContact(response.data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus, adminNotes = '', responseMessage = '') => {
    try {
      const response = await api.put(`${API_ENDPOINTS.CONTACT}/${contactId}/status`, {
        status: newStatus,
        adminNotes,
        responseMessage
      });
      
      if (response.data.success) {
        fetchContacts();
        setShowModal(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact submission?')) {
      try {
        const response = await api.delete(`${API_ENDPOINTS.CONTACT}/${contactId}`);
        if (response.data.success) {
          fetchContacts();
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleSendResponse = async (contactId, responseMessage) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.CONTACT}/${contactId}/send-response`, {
        responseMessage
      });
      
      if (response.data.success) {
        fetchContacts();
        alert('Response email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending response email:', error);
      alert('Failed to send response email. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectLabel = (subject) => {
    const labels = {
      general: 'General Inquiry',
      product: 'Product Information',
      order: 'Order Support',
      other: 'Other'
    };
    return labels[subject] || subject;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Contact Submissions - Admin Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="mt-2 text-gray-600">
            Manage and respond to customer inquiries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={fetchContacts}
              className="flex items-center justify-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No contact submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSubjectLabel(contact.subject)}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {contact.message.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                          {statusIcons[contact.status]}
                          <span className="ml-1 capitalize">{contact.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleViewContact(contact._id)}
                          className="text-blue-600 hover:text-blue-900"
                          variant="outline"
                          size="sm"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleViewContact(contact._id)}
                          className="text-green-600 hover:text-green-900"
                          variant="outline"
                          size="sm"
                          title="Send Response"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteContact(contact._id)}
                          className="text-red-600 hover:text-red-900"
                          variant="outline"
                          size="sm"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalContacts)} of {pagination.totalContacts} results
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNext}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setShowModal(false);
            setSelectedContact(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onSendResponse={handleSendResponse}
        />
      )}
    </div>
  );
};

// Contact Detail Modal Component
const ContactDetailModal = ({ contact, onClose, onUpdateStatus, onSendResponse }) => {
  const [status, setStatus] = useState(contact.status);
  const [adminNotes, setAdminNotes] = useState(contact.adminNotes || '');
  const [responseMessage, setResponseMessage] = useState(contact.responseMessage || '');
  const [isSendingResponse, setIsSendingResponse] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(contact._id, status, adminNotes, responseMessage);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }
    
    setIsSendingResponse(true);
    try {
      await onSendResponse(contact._id, responseMessage);
      onClose();
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsSendingResponse(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Contact Details">
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-900">{contact.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{contact.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{contact.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <p className="text-sm text-gray-900">{contact.subject}</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* Status Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Add internal notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Message</label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Response message to send to customer..."
            />
          </div>

          <div className="flex justify-between">
            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={handleSendResponse}
                disabled={isSendingResponse || !responseMessage.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSendingResponse ? 'Sending...' : 'Send Response Email'}
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Update Status
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default Contacts;
