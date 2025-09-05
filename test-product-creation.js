// Test script to verify product creation with Cloudinary integration
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test data
const testProduct = {
  name: 'Test Product',
  description: 'This is a test product for Cloudinary integration',
  price: 99.99,
  stock: 10,
  category: '64a1b2c3d4e5f6789012345', // Replace with actual category ID
  sku: 'TEST-001',
  isActive: true,
  isFeatured: false
};

// Create a test image file (1x1 pixel PNG)
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

async function testProductCreation() {
  try {
    console.log('Testing product creation with Cloudinary integration...');
    
    // Create FormData
    const formData = new FormData();
    
    // Add product data
    Object.keys(testProduct).forEach(key => {
      formData.append(key, testProduct[key]);
    });
    
    // Add test image
    formData.append('images', testImageData, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // Make request to create product
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Product creation successful!');
      console.log('Product ID:', result.data.product._id);
      console.log('Images uploaded:', result.data.product.images.length);
      result.data.product.images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, img.url);
      });
    } else {
      console.log('❌ Product creation failed:');
      console.log('Status:', response.status);
      console.log('Error:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for running the test
console.log('📋 Test Instructions:');
console.log('1. Make sure the backend server is running (npm start in backend directory)');
console.log('2. Create an admin user and get the JWT token');
console.log('3. Replace YOUR_ADMIN_TOKEN_HERE with the actual admin token');
console.log('4. Replace the category ID with an actual category ID from your database');
console.log('5. Run: node test-product-creation.js');
console.log('');

// Uncomment the line below to run the test
// testProductCreation();

