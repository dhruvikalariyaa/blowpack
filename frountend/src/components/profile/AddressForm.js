import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  MapPinIcon, 
  HomeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const AddressForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  address = null, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        isDefault: address.isDefault || false
      });
    } else {
      setFormData({
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    }
    setErrors({});
  }, [address, isOpen]);

  // Function to fetch pincode details
  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District || '',
            state: postOffice.State || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching pincode details:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-fill city and state when pincode is entered
    if (name === 'pincode') {
      fetchPincodeDetails(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/30 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-3">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {address ? 'Edit Address' : 'Add New Address'}
              </h2>
              <p className="text-gray-600">
                {address ? 'Update your delivery address' : 'Add a new delivery address'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={4}
              className={`input-field resize-none ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter complete address with street, area, landmark..."
              disabled={loading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
                {formData.city && formData.pincode.length === 6 && (
                  <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
                )}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`input-field ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter city"
                disabled={loading}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
                {formData.state && formData.pincode.length === 6 && (
                  <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
                )}
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`input-field ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter state"
                disabled={loading}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode <span className="text-red-500">*</span>
              {pincodeLoading && (
                <span className="ml-2 text-xs text-blue-600 flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-1">Looking up...</span>
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className={`input-field ${errors.pincode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter 6-digit pincode"
                disabled={loading || pincodeLoading}
                maxLength={6}
              />
              {pincodeLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
            )}
            {formData.pincode.length === 6 && !pincodeLoading && formData.city && formData.state && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Auto-filled: {formData.city}, {formData.state}
              </p>
            )}
          </div>

          {/* Default Address Checkbox */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                disabled={loading}
              />
              <div className="flex-1">
                <label htmlFor="isDefault" className="block text-sm font-medium text-gray-700 mb-1">
                  Set as default delivery address
                </label>
                <p className="text-xs text-gray-600">
                  This address will be used as the default for all new orders and will be pre-selected during checkout.
                </p>
              </div>
            </div>
          </div>

          </form>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center transition-all duration-200"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                {address ? 'Update Address' : 'Add Address'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
