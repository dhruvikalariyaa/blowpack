const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) {
      updates.name = name.trim();
    }

    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        });
      }
      updates.phone = phone;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', authenticateToken, validateAddress, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, isDefault } = req.body;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await User.updateMany(
        { _id: req.user._id, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const newAddress = {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: newAddress } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get addresses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', authenticateToken, validateAddress, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, address, city, state, pincode, isDefault } = req.body;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await User.updateMany(
        { _id: req.user._id, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const updateData = {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    };

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'addresses._id': addressId },
      { $set: { 'addresses.$': updateData } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Address update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Address deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/addresses/:addressId/default
// @desc    Set address as default
// @access  Private
router.put('/addresses/:addressId/default', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    // First, unset all default addresses
    await User.updateMany(
      { _id: req.user._id, 'addresses.isDefault': true },
      { $set: { 'addresses.$.isDefault': false } }
    );

    // Then set the selected address as default
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'addresses._id': addressId },
      { $set: { 'addresses.$.isDefault': true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
