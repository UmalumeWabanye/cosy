const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image')) {
    return cb(new ErrorResponse('Only image files are allowed', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// @desc    Upload property image
// @route   POST /api/admin/properties/:id/upload-image
// @access  Private
const uploadPropertyImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No file uploaded', 400));
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    // Generate image URL (you can adjust based on your setup)
    const imageUrl = `/uploads/properties/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadPropertyImage, upload };
