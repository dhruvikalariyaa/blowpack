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
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await loadGoogleSignInScript();
        await initializeGoogleSignIn();
        
        // Render Google Sign-In button
        renderGoogleSignInButton('google-signin-button', handleGoogleSuccess, handleGoogleError);
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        // Show a message that Google OAuth is not configured
        const buttonContainer = document.getElementById('google-signin-button');
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
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Login - Blow Pack Plastic Industries</title>
        <meta name="description" content="Login to your Blow Pack Plastic account to access your orders, wishlist, and more." />
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
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
                Sign in
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
              <div id="google-signin-button" className="w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
