import React from 'react';

const PerfectLoader = ({ 
  size = 'lg', 
  className = '', 
  text = 'Loading...', 
  showText = true,
  variant = 'primary',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const variantClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Main Loader Animation */}
        <div className="relative">
          {/* Outer Ring */}
          <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 animate-spin`}>
            <div className={`absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-current ${variantClasses[variant]} animate-spin`} 
                 style={{ animationDuration: '1s' }}>
            </div>
          </div>
          
          {/* Center Dot */}
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-2 h-2 rounded-full bg-current ${variantClasses[variant]} animate-ping`}></div>
          </div>
        </div>

        {/* Loading Text */}
        {showText && text && (
          <div className={`${textSizeClasses[size]} font-medium ${variantClasses[variant]} animate-pulse`}>
            {text}
          </div>
        )}

        {/* Animated Dots */}
        {showText && (
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full bg-current ${variantClasses[variant]} animate-bounce`} 
                 style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full bg-current ${variantClasses[variant]} animate-bounce`} 
                 style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full bg-current ${variantClasses[variant]} animate-bounce`} 
                 style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized Loader Components
export const AuthLoader = ({ text = 'Authenticating...' }) => (
  <PerfectLoader 
    size="xl" 
    text={text} 
    variant="primary" 
    fullScreen={true}
    className="bg-gradient-to-br from-primary-50 to-primary-100"
  />
);

export const PageLoader = ({ text = 'Loading page...' }) => (
  <PerfectLoader 
    size="lg" 
    text={text} 
    variant="primary" 
    className="min-h-screen bg-gray-50"
  />
);

export const ButtonLoader = ({ size = 'sm' }) => (
  <PerfectLoader 
    size={size} 
    text="" 
    showText={false} 
    variant="white"
  />
);

export const CardLoader = ({ text = 'Loading...' }) => (
  <PerfectLoader 
    size="md" 
    text={text} 
    variant="gray" 
    className="py-8"
  />
);

export const ModalLoader = ({ text = 'Processing...' }) => (
  <PerfectLoader 
    size="lg" 
    text={text} 
    variant="primary" 
    className="py-12"
  />
);

export default PerfectLoader;
