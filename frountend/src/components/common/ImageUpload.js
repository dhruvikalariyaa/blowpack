import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../config/api';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  multiple = true,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validate file count
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError(null);

    // For product creation/editing, we'll store the files directly
    // and upload them when the form is submitted
    const newImages = validFiles.map(file => ({
      file: file,
      url: URL.createObjectURL(file), // Create preview URL
      alt: `Product image`,
      isNew: true // Flag to identify new files
    }));

    onImagesChange([...images, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    
    // Clean up object URL if it's a new file
    if (imageToRemove && imageToRemove.isNew && imageToRemove.url) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.isNew && image.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={openFileDialog}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          uploading 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            {uploading ? (
              <span className="text-blue-600">Uploading...</span>
            ) : (
              <>
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                {' '}or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB each
            {multiple && ` (max ${maxImages} images)`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              {image.isNew && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                  New
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
