import React from 'react';
import { 
  MapPinIcon, 
  PencilIcon, 
  TrashIcon, 
  StarIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  isDefault = false,
  loading = false 
}) => {
  return (
    <div className={`group relative bg-white border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      isDefault 
        ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-blue-100' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-blue-50'
    }`}>
      {/* Header Section */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Home Icon */}
        <div className={`p-3 rounded-xl shadow-sm ${
          isDefault 
            ? 'bg-blue-100 shadow-blue-200' 
            : 'bg-gray-100'
        }`}>
          <HomeIcon className={`h-6 w-6 ${
            isDefault ? 'text-blue-600' : 'text-gray-600'
          }`} />
        </div>
        
        {/* Title and Default Badge */}
        <div className="flex items-center space-x-3">
          <h3 className="font-bold text-gray-900 text-lg">
            Delivery Address
          </h3>
          {isDefault && (
            <div className="flex items-center space-x-1.5 bg-yellow-100 px-3 py-1.5 rounded-full shadow-sm border border-yellow-200">
              <StarIconSolid className="h-3.5 w-3.5 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-800">Default</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Address Details Section */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-2 bg-gray-100/80 rounded-xl flex-shrink-0 mt-1">
          <MapPinIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <p className="text-gray-900 font-semibold leading-relaxed text-sm">
              {address.address}
            </p>
            <p className="text-gray-600 font-medium text-sm">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Bottom */}
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
        {!isDefault && (
          <button
            onClick={() => onSetDefault(address._id)}
            disabled={loading}
            className="px-3 py-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium border border-gray-200 hover:border-yellow-300"
            title="Set as default"
          >
            <div className="flex items-center space-x-1.5">
              <StarIcon className="h-4 w-4" />
              <span>Set Default</span>
            </div>
          </button>
        )}
        
        <button
          onClick={() => onEdit(address)}
          disabled={loading}
          className="px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium border border-gray-200 hover:border-blue-300"
          title="Edit address"
        >
          <div className="flex items-center space-x-1.5">
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </div>
        </button>
        
        <button
          onClick={() => onDelete(address._id)}
          disabled={loading}
          className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium border border-gray-200 hover:border-red-300"
          title="Delete address"
        >
          <div className="flex items-center space-x-1.5">
            <TrashIcon className="h-4 w-4" />
            <span>Delete</span>
          </div>
        </button>
      </div>
      
      {/* Subtle gradient overlay for default cards */}
      {isDefault && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent rounded-2xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default AddressCard;
