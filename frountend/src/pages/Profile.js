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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <Helmet>
        <title>My Profile - Packwell Plastic Industries</title>
      </Helmet>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
       

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-md animate-slideIn">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'addresses'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>Addresses</span>
                  {user?.addresses?.length > 0 && (
                    <span className="bg-white/20 text-white py-0.5 px-1.5 rounded-full text-xs font-bold">
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slideIn">
            <div className="p-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div 
                    className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer group relative overflow-hidden shadow-lg border-2 border-white"
                    onClick={!isUploading ? handleImageClick : undefined}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-blue-400" />
                    )}
                    
                    {/* Upload Progress Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                        <div className="text-center">
                          <LoadingSpinner size="sm" />
                          <p className="text-white text-xs mt-1 font-semibold">{uploadProgress}%</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    {!isUploading && (
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/80 transition-all duration-300 flex items-center justify-center rounded-full">
                        <CameraIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button */}
                  {imagePreview && !isUploading && (
                    <button
                      onClick={handleDeleteImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-3 h-3" />
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
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none text-sm"
                  >
                    <CameraIcon className="w-3 h-3 mr-1.5" />
                    {isUploading ? 'Uploading...' : (imagePreview ? 'Change' : 'Add Photo')}
                  </button>
                  
                  {isUploading && (
                    <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="Enter your full name"
                      />
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-gray-50 cursor-not-allowed pr-20 transition-all duration-300"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {user?.emailVerified ? (
                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircleIcon className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-semibold text-green-700">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                            <ExclamationTriangleIcon className="h-3 w-3 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700">Unverified</span>
                          </div>
                        )}
                      </div>
                    </div>
                     {/* Email Verification Status */}
                    {!user?.emailVerified && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-orange-100 rounded-full flex-shrink-0">
                            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-orange-800 mb-1">
                              Email Not Verified
                            </h4>
                            <p className="text-xs text-orange-700 mb-3 leading-relaxed">
                              Please verify your email address to receive important updates about your orders.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShouldResetModal(true);
                                setIsEmailVerificationOpen(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              Verify Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing || loading}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="Enter your phone number"
                      />
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role Field (Read-only) */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                      Account Type
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="role"
                        value={user?.role === 'admin' ? 'Administrator' : 'Customer'}
                        disabled
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-gray-50 cursor-not-allowed transition-all duration-300"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                          user?.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            user?.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-xs font-semibold">
                            {user?.role === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
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
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
          <div className="space-y-6 animate-slideIn">
            {/* Add Address Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delivery Addresses</h2>
                <p className="text-gray-600 text-sm">Manage your delivery locations</p>
              </div>
              <button
                onClick={handleAddAddress}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Add Address
              </button>
            </div>

            {/* Addresses List */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <HomeIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No addresses yet</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">Get started by adding your first delivery address to make ordering easier.</p>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Address
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
