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
    <div className={`bg-white border-2 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 ${
      isDefault ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`p-3 rounded-xl shadow-sm ${
            isDefault ? 'bg-blue-100 shadow-blue-100' : 'bg-gray-100'
          }`}>
            <HomeIcon className={`h-6 w-6 ${
              isDefault ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                Delivery Address
              </h3>
              {isDefault && (
                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                  <StarIconSolid className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-700">Default</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-gray-100 rounded-lg mt-0.5 flex-shrink-0">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium leading-relaxed">{address.address}</p>
                  <p className="text-gray-600 mt-1">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          {!isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Set as default"
            >
              <StarIcon className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={() => onEdit(address)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Edit address"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(address._id)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Delete address"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
