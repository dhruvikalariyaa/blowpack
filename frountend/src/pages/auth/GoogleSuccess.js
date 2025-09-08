import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { getCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      if (token) {
        // Store the token
        localStorage.setItem('token', token);
        
        // Get user data
        try {
          await dispatch(getCurrentUser()).unwrap();
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Failed to get user data:', error);
          navigate('/login', { 
            replace: true,
            state: { error: 'Google authentication failed' }
          });
        }
      } else {
        navigate('/login', { 
          replace: true,
          state: { error: 'No authentication token received' }
        });
      }
    };

    handleGoogleAuthSuccess();
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Google Authentication - Blow Pack Plastic Industries</title>
        <meta name="description" content="Completing Google authentication..." />
      </Helmet>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Blow Pack Plastic" 
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold text-primary-600">Blow Pack Plastic</h1>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Completing Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your Google authentication...
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-gray-600 text-center">
              Setting up your account...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSuccess;
