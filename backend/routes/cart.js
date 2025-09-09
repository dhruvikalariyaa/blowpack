const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images ratings isActive');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Force refresh: Get fresh product data from database
    // Extract ObjectIds properly - item.product might be populated or ObjectId
    const productIds = cart.items.map(item => {
      if (item.product && item.product._id) {
        // Product is populated, extract the _id
        return item.product._id;
      } else {
        // Product is ObjectId
        return item.product;
      }
    });
    
    const freshProductData = await Product.find({ 
      _id: { $in: productIds } 
    }).select('name price images ratings isActive isFeatured');
    
    // Create a map for quick lookup
    const productMap = new Map();
    freshProductData.forEach(product => {
      productMap.set(product._id.toString(), product);
    });
    
    // Update cart items with fresh product data
    const updatedItems = cart.items.map(item => {
      // Get the correct ObjectId for comparison
      const itemProductId = item.product && item.product._id ? item.product._id : item.product;
      const freshProduct = productMap.get(itemProductId.toString());
      
      if (freshProduct) {
        return {
          ...item,
          product: freshProduct
        };
      }
      return item;
    });
    
    // Filter out inactive products
    const activeItems = updatedItems.filter(item => item.product && item.product.isActive);
    
    if (activeItems.length !== cart.items.length) {
      console.log('🧹 Removing inactive products from cart:', {
        originalItems: cart.items.length,
        activeItems: activeItems.length,
        removedItems: cart.items.length - activeItems.length
      });
      cart.items = activeItems;
      await cart.save();
    }

    // Use activeItems for response (only active products)
    cart.items = activeItems;

    // Properly serialize the cart for JSON response
    const serializedCart = {
      _id: cart._id,
      user: cart.user,
      items: cart.items.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          ratings: item.product.ratings,
          isActive: item.product.isActive,
          isFeatured: item.product.isFeatured
        },
        quantity: item.quantity,
        price: item.price
      })),
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      totalDiscount: cart.totalDiscount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    res.json({
      success: true,
      data: {
        cart: serializedCart
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }


    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images ratings isActive');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    console.log('🔄 Cart update request:', { productId, quantity, userId: req.user._id });

    if (!productId || quantity === undefined) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    if (quantity < 1) {
      console.log('❌ Invalid quantity:', quantity);
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }


    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find and update item
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    console.log('📝 Updating cart item:', { 
      itemIndex, 
      oldQuantity: cart.items[itemIndex].quantity, 
      newQuantity: quantity 
    });
    
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    await cart.save();
    console.log('✅ Cart saved successfully');

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images ratings isActive');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/cart/remove
// @desc    Remove item from cart
// @access  Private
router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images ratings isActive');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: populatedCart
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart items count
// @access  Private
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          count: 0
        }
      });
    }

    const count = cart.items.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
