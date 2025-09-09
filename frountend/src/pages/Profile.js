import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateProfile, 
  uploadProfileImage, 
  deleteProfileImage,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  clearError, 
  clearSuccess 
} from '../store/slices/authSlice';
import IsolatedEmailModal from '../components/common/IsolatedEmailModal';
import { 
  UserIcon, 
  CameraIcon, 
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  PlusIcon,
  MapPinIcon,
  HomeIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import AddressCard from '../components/profile/AddressCard';
import AddressForm from '../components/profile/AddressForm';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector(state => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Address management state
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'addresses'
  
  // Email verification state
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(() => {
    // Check if modal was open before page refresh
    const savedState = localStorage.getItem('emailVerificationModalOpen');
    return savedState === 'true';
  });
  const [shouldResetModal, setShouldResetModal] = useState(() => {
    // Only reset if there's no saved step (fresh start)
    const savedStep = localStorage.getItem('emailVerificationStep');
    return !savedStep || savedStep === 'send';
  });
  
  // Save modal state to localStorage
  useEffect(() => {
    if (isEmailVerificationOpen) {
      localStorage.setItem('emailVerificationModalOpen', 'true');
    } else {
      localStorage.removeItem('emailVerificationModalOpen');
    }
  }, [isEmailVerificationOpen]);

  // Check if modal should open with verify step on page load
  useEffect(() => {
    const savedStep = localStorage.getItem('emailVerificationStep');
    const savedModalOpen = localStorage.getItem('emailVerificationModalOpen');
    
    if (savedModalOpen === 'true' && savedStep === 'verify') {
      console.log('Page loaded with verify step - opening modal');
      setIsEmailVerificationOpen(true);
      setShouldResetModal(false);
    }
  }, []);

  // Reset shouldResetModal flag after modal opens
  useEffect(() => {
    if (isEmailVerificationOpen && shouldResetModal) {
      // Reset the flag after a short delay to allow modal to reset
      const timer = setTimeout(() => {
        setShouldResetModal(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEmailVerificationOpen, shouldResetModal]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
      if (user.profileImage?.url) {
        setImagePreview(user.profileImage.url);
      }
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Cleanup upload state on unmount
  useEffect(() => {
    return () => {
      setIsUploading(false);
      setUploadProgress(0);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await dispatch(updateProfile(formData));
      setIsEditing(false);
    }
  };

  // Compress image function
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB original, will be compressed to ~2MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Reset upload state
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Show immediate progress
        setUploadProgress(10);
        
        // Compress image for faster upload
        setUploadProgress(20);
        const compressedFile = await compressImage(file);
        
        // Create preview with compressed image
        setUploadProgress(30);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
        
        // Upload compressed image
        setUploadProgress(50);
        const result = await dispatch(uploadProfileImage(compressedFile));
        
        setUploadProgress(100);
        
        // Reset upload state quickly
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
        
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Upload error:', error);
        
        // Show specific error message based on error type
        if (error.code === 'ECONNABORTED') {
          alert('Upload timed out. Please try again with a smaller image or check your internet connection.');
        } else if (error.response?.status === 413) {
          alert('File too large. Please select an image smaller than 5MB.');
        } else if (error.response?.status === 415) {
          alert('Invalid file type. Please select a valid image file (PNG, JPG, GIF).');
        } else if (error.response?.status === 500) {
          alert('Server error. Please try again later or contact support if the problem persists.');
        } else {
          alert('Upload failed. Please check your internet connection and try again.');
        }
      }
    }
  };

  const handleDeleteImage = () => {
    if (window.confirm('Are you sure you want to delete your profile image?')) {
      dispatch(deleteProfileImage());
      setImagePreview(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Address management functions
  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
    // Switch to addresses tab when adding new address
    setActiveTab('addresses');
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
    // Switch to addresses tab when editing address
    setActiveTab('addresses');
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      if (editingAddress) {
        await dispatch(updateAddress({ 
          addressId: editingAddress._id, 
          addressData 
        }));
      } else {
        await dispatch(addAddress(addressData));
      }
      setIsAddressFormOpen(false);
      setEditingAddress(null);
      // Ensure we stay on the addresses tab after address operations
      setActiveTab('addresses');
    } catch (error) {
      console.error('Address operation failed:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteAddress(addressId));
        // Ensure we stay on the addresses tab after deletion
        setActiveTab('addresses');
      } catch (error) {
        console.error('Delete address failed:', error);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await dispatch(setDefaultAddress(addressId));
      // Ensure we stay on the addresses tab after setting default
      setActiveTab('addresses');
    } catch (error) {
      console.error('Set default address failed:', error);
    }
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
    // Ensure we stay on the addresses tab when closing the form
    setActiveTab('addresses');
  };

  if (loading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>My Profile - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Profile Information</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'addresses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>Delivery Addresses</span>
                  {user?.addresses?.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {user.addresses.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer group relative overflow-hidden"
                    onClick={!isUploading ? handleImageClick : undefined}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    )}
                    
                    {/* Upload Progress Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="sm" />
                          <p className="text-white text-xs mt-2">{uploadProgress}%</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    {!isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button */}
                  {imagePreview && !isUploading && (
                    <button
                      onClick={handleDeleteImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading || isUploading}
                />
                
                <div className="mt-4 text-center">
                  <button
                    onClick={handleImageClick}
                    disabled={loading || isUploading}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : (imagePreview ? 'Change Photo' : 'Add Photo')}
                  </button>
                  
                  {isUploading && (
                    <div className="w-32 bg-gray-200 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter your full name"
                      />
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed pr-20"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {user?.emailVerified ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span className="text-xs font-medium">Unverified</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    
                    {/* Email Verification Status */}
                    {!user?.emailVerified && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-orange-800 mb-1">
                              Email Not Verified
                            </h4>
                            <p className="text-xs text-orange-700 mb-3">
                              Please verify your email address to receive important updates about your orders and ensure account security.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShouldResetModal(true);
                                setIsEmailVerificationOpen(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              Verify Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {user?.emailVerified && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-green-800">
                              Email Verified
                            </h4>
                            <p className="text-xs text-green-700">
                              Your email is verified. You'll receive important updates about your orders.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter your phone number"
                      />
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Field (Read-only) */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={user?.role === 'admin' ? 'Administrator' : 'Customer'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          phone: user?.phone || ''
                        });
                      }}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {/* Add Address Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Delivery Addresses</h2>
                </div>
              <button
                onClick={handleAddAddress}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Address
              </button>
            </div>

            {/* Addresses List */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    isDefault={address.isDefault}
                    onEdit={handleEditAddress}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new delivery address.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Address
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Address Form Modal */}
        <AddressForm
          isOpen={isAddressFormOpen}
          onClose={handleCloseAddressForm}
          onSubmit={handleAddressSubmit}
          address={editingAddress}
          loading={loading}
        />

        {/* Email Verification Modal */}
        <IsolatedEmailModal
          isOpen={isEmailVerificationOpen}
          shouldReset={shouldResetModal}
          onClose={() => {
            // Clear localStorage when modal is closed
            localStorage.removeItem('emailVerificationOtp');
            localStorage.removeItem('emailVerificationStep');
            localStorage.removeItem('emailVerificationModalOpen');
            setShouldResetModal(false);
            setIsEmailVerificationOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
