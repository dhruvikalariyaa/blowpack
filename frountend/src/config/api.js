const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  GET_CURRENT_USER: `${API_BASE_URL}/api/auth/me`,
  
  // User profile endpoints
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  USER_PROFILE_IMAGE: `${API_BASE_URL}/api/users/profile/image`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
  
  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/api/categories/${id}`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/admin/products`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
  ADMIN_REVIEWS: `${API_BASE_URL}/api/admin/reviews`,
  
  // Upload endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload/image`,
  UPLOAD_IMAGES: `${API_BASE_URL}/api/upload/images`,
  
  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  
  // Wishlist endpoints
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  
  // Review endpoints
  REVIEWS: `${API_BASE_URL}/api/reviews`,
};

export default API_BASE_URL;

