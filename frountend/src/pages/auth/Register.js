import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { registerUser, clearError, clearSuccess, googleAuth } from '../../store/slices/authSlice';
import { loadGoogleSignInScript, initializeGoogleSignIn, renderGoogleSignInButton } from '../../utils/googleAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, loading, error, success } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data);
    dispatch(registerUser(data));
  };

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch('/api/auth/test');
      const data = await response.json();
      console.log('Backend test response:', data);
    } catch (error) {
      console.error('Backend test failed:', error);
    }
  };

  // Test on component mount
  useEffect(() => {
    testBackend();
  }, []);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await loadGoogleSignInScript();
        await initializeGoogleSignIn();
        
        // Render Google Sign-In button
        renderGoogleSignInButton('google-signup-button', handleGoogleSuccess, handleGoogleError);
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        // Show a message that Google OAuth is not configured
        const buttonContainer = document.getElementById('google-signup-button');
        if (buttonContainer) {
          buttonContainer.innerHTML = `
            <div class="w-full p-3 text-center text-sm text-gray-500 bg-gray-100 rounded-md border">
              Google Sign-In is not configured. Please set up Google OAuth credentials.
            </div>
          `;
        }
      }
    };

    initGoogleAuth();
  }, []);

  const handleGoogleSuccess = async (userInfo, credential) => {
    try {
      await dispatch(googleAuth({ userInfo, credential })).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Google authentication failed:', error);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign-In error:', error);
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Register - Blow Pack Plastic Industries</title>
        <meta name="description" content="Create your Blow Pack Plastic account to start shopping for premium plastic products." />
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="Full Name"
                type="text"
                name="name"
                register={register}
                validation={{
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                }}
                error={errors.name?.message}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Input
                label="Email address"
                type="email"
                name="email"
                register={register}
                validation={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                }}
                error={errors.email?.message}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                register={register}
                validation={{
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                }}
                error={errors.phone?.message}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  register={register}
                  validation={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    }
                  }}
                  error={errors.password?.message}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  register={register}
                  validation={{
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match'
                  }}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <div id="google-signup-button" className="w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
