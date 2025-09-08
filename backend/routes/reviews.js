const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateReview, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: 'delivered'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not delivered yet'
      });
    }

    // Check if product was in the order
    const orderItem = order.items.find(item => item.product.toString() === productId);
    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'Product was not in this order'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this product and order'
      });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: true // Verified since it's from a delivered order
    });

    console.log('Creating review with data:', {
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment
    });

    await review.save();
    console.log('Review saved successfully with ID:', review._id);

    // Update product ratings
    await updateProductRatings(productId);

    // Populate review for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('product', 'name')
      .populate('order', 'orderNumber');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Review creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', validatePagination, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId
    if (!productId || productId === 'undefined' || productId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const query = { 
      product: productId, 
      isApproved: true 
    };

    // Rating filter
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
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
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        reviews,
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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', authenticateToken, validateReview, async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    review.images = images || review.images;

    await review.save();

    // Update product ratings
    await updateProductRatings(review.product);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('product', 'name')
      .populate('order', 'orderNumber');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Review update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product ratings
    await updateProductRatings(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Review deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { isHelpful } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (isHelpful) {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review feedback recorded',
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful
      }
    });
  } catch (error) {
    console.error('Review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews (Admin)
// @access  Private (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Status filter
    if (req.query.status) {
      query.isApproved = req.query.status === 'approved';
    }

    // Rating filter
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
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
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve/reject review (Admin)
// @access  Private (Admin only)
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user', 'name')
     .populate('product', 'name')
     .populate('order', 'orderNumber');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update product ratings if review is approved
    if (isApproved) {
      await updateProductRatings(review.product);
    }

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to update product ratings
async function updateProductRatings(productId) {
  try {
    console.log('Updating product ratings for:', productId);
    
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    console.log('Rating stats:', stats);

    let newAverage = 0;
    let newCount = 0;

    if (stats.length > 0 && stats[0].count > 0) {
      newAverage = Math.round(stats[0].average * 10) / 10;
      newCount = stats[0].count;
      console.log(`Updating product ${productId} to: ${newAverage} stars (${newCount} reviews)`);
    } else {
      console.log('No approved reviews found, setting to 0');
    }
    
    // Always update the product, even if no reviews
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': newAverage,
      'ratings.count': newCount
    });
    
    console.log('Product ratings updated successfully');
  } catch (error) {
    console.error('Update product ratings error:', error);
  }
}

// @route   POST /api/reviews/update-all-ratings
// @desc    Update ratings for all products (admin only)
// @access  Private/Admin
router.post('/update-all-ratings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Updating ratings for all products...');
    
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (const product of products) {
      await updateProductRatings(product._id);
      updatedCount++;
    }
    
    res.json({
      success: true,
      message: `Updated ratings for ${updatedCount} products`
    });
  } catch (error) {
    console.error('Update all ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ratings',
      error: error.message
    });
  }
});

module.exports = router;
