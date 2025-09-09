import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginUser, clearError, clearSuccess, googleAuth } from '../../store/slices/authSlice';
import { loadGoogleSignInScript, initializeGoogleSignIn, renderGoogleSignInButton } from '../../utils/googleAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner, { AuthLoader } from '../../components/common/LoadingSpinner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, loading, error, success } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  // Combined effect for authentication and cleanup
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [isAuthenticated, navigate, from, dispatch]);

  // Initialize Google Sign-In only once
  useEffect(() => {
    let isMounted = true;
    
    const initGoogleAuth = async () => {
      try {
        await loadGoogleSignInScript();
        if (isMounted) {
          await initializeGoogleSignIn();
          renderGoogleSignInButton('google-signin-button', handleGoogleSuccess, handleGoogleError);
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (isMounted) {
          const buttonContainer = document.getElementById('google-signin-button');
          if (buttonContainer) {
            buttonContainer.innerHTML = `
              <div class="w-full p-3 text-center text-sm text-gray-500 bg-gray-100 rounded-md border">
                Google Sign-In is not configured. Please set up Google OAuth credentials.
              </div>
            `;
          }
        }
      }
    };

    initGoogleAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleSuccess = async (userInfo, credential) => {
    try {
      await dispatch(googleAuth({ userInfo, credential })).unwrap();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google authentication failed:', error);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign-In error:', error);
  };

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  if (loading) {
    return <AuthLoader text="Signing you in..." />;
  }

  return (
    <div className="auth-container">
      <Helmet>
        <title>Login - Blow Pack Plastic Industries</title>
        <meta name="description" content="Login to your Blow Pack Plastic account to access your orders, wishlist, and more." />
      </Helmet>

      {/* Background Elements */}
      <div className="auth-background"></div>
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      <div className="flex flex-col justify-center min-h-screen py-8 sm:py-12 sm:px-4 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
          <div className="text-center animate-slideIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Sign in to your account to continue
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg animate-slideInUp ">
          <div className="auth-card">
            {/* Premium Header */}
            
            
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
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
                    className="input-field"
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
                        }
                      }}
                      error={errors.password?.message}
                      placeholder="Enter your password"
                      className="input-field pr-12"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-0 pr-3 transform -translate-y-1/2 flex items-center justify-center"
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-xs">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
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
                  className="w-full btn-primary text-base py-3"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-500 font-medium rounded-full border border-gray-100 shadow-sm">Or continue with</span>
                </div>
              </div>

              <div className="mt-3">
                <div id="google-signin-button" className="w-full"></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
