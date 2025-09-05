const express = require('express');
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadImage, uploadMultipleImages } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/upload/image
// @desc    Upload single image to Cloudinary
// @access  Private (Admin only)
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64 for Cloudinary
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const result = await uploadImage(dataURI, 'packwell/products');

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: result.public_id,
        url: result.url,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images to Cloudinary
// @access  Private (Admin only)
router.post('/images', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Convert buffers to base64 for Cloudinary
    const dataURIs = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    });

    const result = await uploadMultipleImages(dataURIs, 'packwell/products');

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        uploaded: result.uploaded,
        failed: result.failed
      }
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Images upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

