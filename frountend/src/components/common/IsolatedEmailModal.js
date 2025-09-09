import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { XMarkIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { sendVerificationEmail, verifyEmail } from '../../store/slices/authSlice';

const IsolatedEmailModal = ({ isOpen, onClose, shouldReset = false }) => {
  const dispatch = useDispatch();
  
  const [otp, setOtp] = useState(() => {
    // Restore OTP from localStorage if available
    return localStorage.getItem('emailVerificationOtp') || '';
  });
  const [step, setStep] = useState(() => {
    // Restore step from localStorage if available
    return localStorage.getItem('emailVerificationStep') || 'send';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset modal state function
  const resetModalState = () => {
    setOtp('');
    setStep('send');
    setError('');
    setSuccess('');
    setIsLoading(false);
    localStorage.removeItem('emailVerificationOtp');
    localStorage.removeItem('emailVerificationStep');
  };

  // Save OTP to localStorage
  useEffect(() => {
    if (otp) {
      localStorage.setItem('emailVerificationOtp', otp);
    } else {
      localStorage.removeItem('emailVerificationOtp');
    }
  }, [otp]);

  // Save step to localStorage
  useEffect(() => {
    if (step !== 'send') {
      localStorage.setItem('emailVerificationStep', step);
    } else {
      localStorage.removeItem('emailVerificationStep');
    }
  }, [step]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
      
      // Reset modal state if shouldReset is true
      if (shouldReset) {
        console.log('Resetting modal state');
        resetModalState();
      } else {
        // Restore step and OTP from localStorage if they exist
        const savedStep = localStorage.getItem('emailVerificationStep');
        const savedOtp = localStorage.getItem('emailVerificationOtp');
        
        console.log('Modal opening - savedStep:', savedStep, 'savedOtp:', savedOtp);
        
        if (savedStep && savedStep !== 'send') {
          console.log('Restoring step from localStorage:', savedStep);
          setStep(savedStep);
        }
        
        if (savedOtp) {
          console.log('Restoring OTP from localStorage:', savedOtp);
          setOtp(savedOtp);
        }
        
        // Clear error and success messages
        setError('');
        setSuccess('');
        setIsLoading(false);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [isOpen, shouldReset]);

  if (!isModalOpen) {
    return null;
  }

  const handleSendCode = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await dispatch(sendVerificationEmail());
      
      if (result.type === 'auth/sendVerificationEmail/fulfilled') {
        setStep('verify');
        // Also save directly to localStorage to ensure it's saved
        localStorage.setItem('emailVerificationStep', 'verify');
        setSuccess('Verification code sent to your email!');
      } else {
        setError(result.payload || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await dispatch(verifyEmail(otp));
      
      if (result.type === 'auth/verifyEmail/fulfilled') {
        // Clear localStorage when verification is successful
        localStorage.removeItem('emailVerificationOtp');
        localStorage.removeItem('emailVerificationStep');
        localStorage.removeItem('emailVerificationModalOpen');
        
        // Close modal immediately after successful verification
        setIsModalOpen(false);
        onClose();
      } else {
        setError(result.payload || 'Failed to verify email');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setError('Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Clear localStorage when modal is closed
          localStorage.removeItem('emailVerificationOtp');
          localStorage.removeItem('emailVerificationStep');
          localStorage.removeItem('emailVerificationModalOpen');
          setIsModalOpen(false);
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Email Verification
            </h3>
          </div>
          <button
            onClick={() => {
              // Clear localStorage when modal is closed
              localStorage.removeItem('emailVerificationOtp');
              localStorage.removeItem('emailVerificationStep');
              localStorage.removeItem('emailVerificationModalOpen');
              setIsModalOpen(false);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {step === 'send' && (
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Send Verification Code
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Click the button below to send a verification code to your email.
              </p>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">
                Enter Verification Code
              </h4>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Enter the 6-digit code from your email.
              </p>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && otp.length === 6 && !isLoading) {
                      handleVerify();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Email Verified Successfully!
              </h4>
              <p className="text-sm text-gray-600">
                Your email has been verified. You'll now receive important updates about your orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IsolatedEmailModal;
