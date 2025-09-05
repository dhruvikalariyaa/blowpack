import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HomeIcon } from '@heroicons/react/24/outline';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>404 - Page Not Found | Packwell Plastic Industries</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Or try one of these links:</p>
            <div className="mt-2 space-x-4">
              <Link to="/products" className="text-primary-600 hover:text-primary-500">
                Products
              </Link>
              <Link to="/about" className="text-primary-600 hover:text-primary-500">
                About
              </Link>
              <Link to="/contact" className="text-primary-600 hover:text-primary-500">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
