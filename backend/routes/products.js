const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateProduct, validatePagination } = require('../middleware/validation');
const { uploadImage, uploadMultipleImages, deleteImage } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', validatePagination, optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Build sort
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        case 'rating':
          sort = { 'ratings.average': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
      }
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Product.countDocuments(query);

    // Get categories for filter
    const categories = await Category.find({ isActive: true })
      .select('name slug')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        products,
        categories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(4)
      .select('name slug price images ratings');

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const productData = req.body;

    // Verify category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: populatedProduct
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Product creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify category exists if being updated
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Product update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.public_id).filter(Boolean);
      if (publicIds.length > 0) {
        await deleteImage(publicIds[0]); // Delete first image as example
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Product deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/products/:id/images
// @desc    Upload product images
// @access  Private (Admin only)
router.post('/:id/images', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Upload images to Cloudinary
    const uploadResults = await uploadMultipleImages(req.files, 'packwell/products');

    if (!uploadResults.success) {
      return res.status(500).json({
        success: false,
        message: 'Image upload failed',
        error: uploadResults.error
      });
    }

    // Add new images to product
    const newImages = uploadResults.uploaded.map(result => ({
      public_id: result.public_id,
      url: result.url,
      alt: `Product image for ${product.name}`
    }));

    product.images.push(...newImages);
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: product.images
      }
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/products/:id/images/:imageId
// @desc    Delete product image
// @access  Private (Admin only)
router.delete('/:id/images/:imageId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const imageIndex = product.images.findIndex(img => img._id.toString() === req.params.imageId);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = product.images[imageIndex];

    // Delete from Cloudinary
    if (image.public_id) {
      await deleteImage(image.public_id);
    }

    // Remove from product
    product.images.splice(imageIndex, 1);
    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        images: product.images
      }
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Image deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/products/:id/status
// @desc    Toggle product status
// @access  Private (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/products/:id/featured
// @desc    Toggle featured status
// @access  Private (Admin only)
router.put('/:id/featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isFeatured } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: `Product ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Toggle featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
