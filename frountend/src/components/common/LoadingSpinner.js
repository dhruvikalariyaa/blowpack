import React from 'react';
import PerfectLoader, { 
  AuthLoader, 
  PageLoader, 
  ButtonLoader, 
  CardLoader, 
  ModalLoader 
} from './PerfectLoader';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = 'Loading...', 
  showText = true,
  variant = 'primary',
  fullScreen = false 
}) => {
  return (
    <PerfectLoader
      size={size}
      className={className}
      text={text}
      showText={showText}
      variant={variant}
      fullScreen={fullScreen}
    />
  );
};

// Re-export all specialized loaders
export { 
  AuthLoader, 
  PageLoader, 
  ButtonLoader, 
  CardLoader, 
  ModalLoader 
};

export default LoadingSpinner;
