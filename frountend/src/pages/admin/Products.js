import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdminProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Products - Packwell Plastic Industries</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Products</h1>
          <p className="text-gray-600">Product management coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
