const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateOrder, validatePagination } = require('../middleware/validation');
const { sendEmail, emailTemplates } = require('../utils/email');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod', notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // Check if product is still available
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is no longer available`
        });
      }

      // Check stock
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available for "${product.name}"`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.images[0]?.url || ''
      });
    }

    // Calculate shipping charges (free shipping above ₹500)
    const shippingCharges = subtotal >= 500 ? 0 : 50;
    const totalAmount = subtotal + shippingCharges;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCharges,
      totalAmount,
      notes
    });

    await order.save();

    // Update product stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email
    const user = await User.findById(req.user._id);
    const emailResult = await sendEmail(
      user.email,
      emailTemplates.orderConfirmation(order.orderNumber, user.name, orderItems, totalAmount).subject,
      emailTemplates.orderConfirmation(order.orderNumber, user.name, orderItems, totalAmount).html
    );

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Order creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    // Status filter
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Status filter
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    // Set timestamps based on status
    if (orderStatus === 'shipped') {
      order.shippedAt = new Date();
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
    } else if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    } else if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancellationReason = req.body.cancellationReason || 'Cancelled by admin';
      
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    // Send email notification
    if (orderStatus === 'shipped' && order.trackingNumber) {
      await sendEmail(
        order.user.email,
        emailTemplates.orderShipped(order.orderNumber, order.user.name, order.trackingNumber).subject,
        emailTemplates.orderShipped(order.orderNumber, order.user.name, order.trackingNumber).html
      );
    } else if (orderStatus === 'delivered') {
      await sendEmail(
        order.user.email,
        emailTemplates.orderDelivered(order.orderNumber, order.user.name).subject,
        emailTemplates.orderDelivered(order.orderNumber, order.user.name).html
      );
    }

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (Admin)
// @access  Private (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Monthly orders
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Yearly orders
    const yearlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $in: ['delivered', 'shipped'] },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus,
        monthlyOrders,
        yearlyOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
