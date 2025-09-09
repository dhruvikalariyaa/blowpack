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
    <div className={`group bg-white border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
      isDefault 
        ? 'border-blue-300 bg-blue-50 shadow-blue-100' 
        : 'border-gray-200 hover:border-blue-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2.5 rounded-xl shadow-sm ${
            isDefault 
              ? 'bg-blue-100 shadow-blue-200' 
              : 'bg-gray-100'
          }`}>
            <HomeIcon className={`h-5 w-5 ${
              isDefault ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="font-bold text-gray-900 truncate text-base">
                Delivery Address
              </h3>
              {isDefault && (
                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full shadow-sm">
                  <StarIconSolid className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700">Default</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <div className="p-1.5 bg-gray-100/80 rounded-lg mt-0.5 flex-shrink-0">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold leading-relaxed text-sm">{address.address}</p>
                  <p className="text-gray-600 mt-1 font-medium text-xs">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-3">
          {!isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all duration-300 disabled:opacity-50 group-hover:scale-110"
              title="Set as default"
            >
              <StarIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => onEdit(address)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300 disabled:opacity-50 group-hover:scale-110"
            title="Edit address"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(address._id)}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 disabled:opacity-50 group-hover:scale-110"
            title="Delete address"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
