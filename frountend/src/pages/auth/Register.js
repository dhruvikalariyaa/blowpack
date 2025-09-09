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
    <div className="auth-container">
      <Helmet>
        <title>Register - Blow Pack Plastic Industries</title>
        <meta name="description" content="Create your Blow Pack Plastic account to start shopping for premium plastic products." />
      </Helmet>

      {/* Background Elements */}
      <div className="auth-background"></div>
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      <div className="flex flex-col justify-center min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center animate-slideIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
             Create your account
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
             Sign up to your account to continue
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-2xl animate-slideInUp">
          <div className="auth-card">
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2 mt-2">
                

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      label="Name"
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
                      className="input-field mt-2"
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
                      className="input-field mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    label="Email Address"
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
                    placeholder="Enter your email address"
                    className="input-field mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                        placeholder="Create a strong password"
                        className="input-field pr-12 mt-2"
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-0 pr-3 flex items-center justify-center group"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
                        className="input-field pr-12 mt-2"
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-0 pr-3  flex items-center justify-center group"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start mt-2">
                <div className="flex items-center h-4">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    required
                    className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="ml-2 text-xs">
                  <label htmlFor="agree-terms" className="font-medium text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-primary-600 hover:text-primary-500 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm animate-slideIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-sm animate-slideIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full btn-primary text-base py-3 mt-2 mb-2"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>

            <div className="mt-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-3 mb-2">
                <div id="google-signup-button" className="w-full"></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
