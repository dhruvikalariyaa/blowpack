import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminNavbar from "../../components/layout/AdminNavbar";
import ImageUpload from "../../components/common/ImageUpload";
import { API_ENDPOINTS } from "../../config/api";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sku: "",
    isActive: true,
    isFeatured: false,
    images: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_PRODUCTS}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data.products);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CATEGORIES, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      const url = editingProduct
        ? API_ENDPOINTS.PRODUCT_BY_ID(editingProduct._id)
        : API_ENDPOINTS.PRODUCTS;

      const method = editingProduct ? "PUT" : "POST";

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("stock", formData.stock || "0");
      formDataToSend.append("category", formData.category || "");
      formDataToSend.append("sku", formData.sku || "");
      formDataToSend.append("isActive", formData.isActive.toString());
      formDataToSend.append("isFeatured", formData.isFeatured.toString());

      // Add images if any
      if (formData.images && formData.images.length > 0) {
        const newImages = formData.images.filter(img => img.isNew && img.file);
        newImages.forEach(image => {
          formDataToSend.append("images", image.file);
        });
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save product");
        return;
      }

      // Success
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        sku: "",
        isActive: true,
        isFeatured: false,
        images: [],
      });
      setSuccessMessage(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchProducts();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    // Convert existing images to the new format
    const existingImages = (product.images || []).map((img) => ({
      ...img,
      isNew: false, // Existing images are not new
    }));

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category._id,
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: existingImages,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      sku: "",
      isActive: true,
      isFeatured: false,
      images: [],
    });
    setEditingProduct(null);
    setShowModal(false);
    setError(null); // Clear any errors when resetting form
    setSuccessMessage(null); // Clear any success messages when resetting form
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin Products - Packwell Plastic Industries</title>
      </Helmet>

      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Success
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  {successMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-2 text-gray-600">Manage your product catalog</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.images[0].url || product.images[0]}
                              alt={product.images[0].alt || product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(product)}
                          className="text-green-600 hover:text-green-900"
                          title="View Product"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Product"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Product Modal */}

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>

                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SKU
                    </label>

                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (₹)
                    </label>

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter price (₹)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock
                    </label>

                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>

                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>

                  <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) =>
                      setFormData({ ...formData, images })
                    }
                    maxImages={5}
                    multiple={true}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Product Modal - Modern & Aesthetic */}

        {showViewModal && viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 animate-fadeIn">
            <div className="relative top-4 mx-auto p-4 w-11/12 max-w-6xl shadow-2xl rounded-2xl bg-white animate-slideIn">
              {/* Header with Gradient Background */}

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">
                      {viewingProduct.name}
                    </h3>

                    <p className="text-blue-100 text-lg">
                      {viewingProduct.category?.name || "Uncategorized"}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Product Images - Enhanced Gallery */}

                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>

                      <h4 className="text-2xl font-bold text-gray-900">
                        Product Gallery
                      </h4>
                    </div>

                    {viewingProduct.images &&
                    viewingProduct.images.length > 0 ? (
                      <div className="space-y-4">
                        {/* Main Image */}

                        <div className="relative group">
                          <img
                            src={
                              viewingProduct.images[0].url ||
                              viewingProduct.images[0]
                            }
                            alt={
                              viewingProduct.images[0].alt ||
                              viewingProduct.name
                            }
                            className="w-full h-80 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                          />

                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                        </div>

                        {/* Thumbnail Grid */}

                        {viewingProduct.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-3">
                            {viewingProduct.images
                              .slice(1)
                              .map((image, index) => (
                                <div
                                  key={index}
                                  className="relative group cursor-pointer"
                                >
                                  <img
                                    src={image.url || image}
                                    alt={image.alt || viewingProduct.name}
                                    className="w-full h-20 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300"
                                  />

                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PhotoIcon className="h-8 w-8 text-gray-500" />
                          </div>

                          <p className="text-gray-500 text-lg">
                            No images available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Information - Enhanced Cards */}

                  <div className="space-y-6">
                    {/* Basic Information Card */}

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            i
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900">
                          Basic Information
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-600 mb-1">
                            Product Name
                          </label>

                          <p className="text-lg font-medium text-gray-900">
                            {viewingProduct.name}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-600 mb-1">
                            SKU
                          </label>

                          <p className="text-lg font-mono text-gray-900">
                            {viewingProduct.sku}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <label className="block text-sm font-semibold text-gray-600 mb-1">
                            Description
                          </label>

                          <p className="text-gray-900 leading-relaxed">
                            {viewingProduct.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Inventory Card */}

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            ₹
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900">
                          Pricing & Inventory
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                          <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Price
                          </label>

                          <p className="text-3xl font-bold text-green-600">
                            ₹{viewingProduct.price}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                          <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Stock
                          </label>

                          <p className="text-3xl font-bold text-blue-600">
                            {viewingProduct.stock}
                          </p>

                          <p className="text-sm text-gray-500">units</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            ✓
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900">
                          Status
                        </h4>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm text-center">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                              viewingProduct.isActive
                                ? "bg-green-100 text-green-800 border-2 border-green-200"
                                : "bg-red-100 text-red-800 border-2 border-red-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                viewingProduct.isActive
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>

                            {viewingProduct.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm text-center">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                              viewingProduct.isFeatured
                                ? "bg-blue-100 text-blue-800 border-2 border-blue-200"
                                : "bg-gray-100 text-gray-800 border-2 border-gray-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                viewingProduct.isFeatured
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>

                            {viewingProduct.isFeatured ? "Featured" : "Regular"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Card */}

                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            ℹ
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900">
                          Additional Information
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="font-semibold text-gray-600">
                            Created
                          </span>

                          <span className="text-gray-900">
                            {new Date(
                              viewingProduct.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="font-semibold text-gray-600">
                            Last Updated
                          </span>

                          <span className="text-gray-900">
                            {new Date(
                              viewingProduct.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="font-semibold text-gray-600">
                            Product ID
                          </span>

                          <span className="text-gray-500 font-mono text-sm">
                            {viewingProduct._id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Footer */}

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
