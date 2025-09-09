const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');
const router = express.Router();

// Validation middleware for contact form
const contactValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('subject')
    .isIn(['general', 'product', 'order', 'other'])
    .withMessage('Please select a valid subject'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, subject, message } = req.body;

    // Create new contact entry
    const contact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message
    });

    await contact.save();

    // Send confirmation email to customer
    try {
      const customerEmailTemplate = emailTemplates.contactFormConfirmation({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        message: contact.message
      });
      
      await sendEmail(
        contact.email,
        customerEmailTemplate.subject,
        customerEmailTemplate.html
      );
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      const adminEmailTemplate = emailTemplates.contactFormAdminNotification({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message
      });
      
      // Send to admin email (you can configure this in environment variables)
      const adminEmail = process.env.ADMIN_EMAIL || 'blowpackplastic@gmail.com';
      await sendEmail(
        adminEmail,
        adminEmailTemplate.subject,
        adminEmailTemplate.html
      );
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        id: contact._id,
        fullName: contact.fullName,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalContacts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission (Admin only)
// @access  Private (Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, [
  body('status')
    .isIn(['new', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status value'),
  body('adminNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
  body('responseMessage')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Response message cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminNotes, responseMessage } = req.body;
    const updateData = { status };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (responseMessage) {
      updateData.responseMessage = responseMessage;
      updateData.respondedAt = new Date();
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/contact/:id/send-response
// @desc    Send response email to contact (Admin only)
// @access  Private (Admin)
router.post('/:id/send-response', authenticateToken, [
  body('responseMessage')
    .trim()
    .notEmpty()
    .withMessage('Response message is required')
    .isLength({ max: 2000 })
    .withMessage('Response message cannot exceed 2000 characters')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { responseMessage } = req.body;
    const contactId = req.params.id;

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Send response email
    try {
      const responseEmailTemplate = emailTemplates.contactFormResponse(
        {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          subject: contact.subject,
          message: contact.message
        },
        responseMessage,
        req.user.name || 'Admin'
      );
      
      await sendEmail(
        contact.email,
        responseEmailTemplate.subject,
        responseEmailTemplate.html
      );

      // Update contact status and response
      contact.status = 'resolved';
      contact.responseMessage = responseMessage;
      contact.respondedAt = new Date();
      await contact.save();

      res.json({
        success: true,
        message: 'Response email sent successfully',
        data: {
          contactId: contact._id,
          status: contact.status,
          respondedAt: contact.respondedAt
        }
      });

    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send response email. Please try again.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : 'Email sending failed'
      });
    }

  } catch (error) {
    console.error('Send response email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
