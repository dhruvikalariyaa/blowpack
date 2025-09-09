import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  LockClosedIcon, 
  ArrowRightIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';

const LoginRequired = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Login Required - Blow Pack Plastic Industries</title>
        <meta name="description" content="Please login to access this page." />
      </Helmet>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <LockClosedIcon className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Login Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to be logged in to access this page
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">Access your profile and orders</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">Secure checkout and payment</span>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">Track your order status</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <Link to="/login" className="w-full">
              <Button className="w-full py-3 text-base font-semibold">
                Login to Your Account
              </Button>
            </Link>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <Link 
                to="/register" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-1"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;
