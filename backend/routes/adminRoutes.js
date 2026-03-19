const express = require('express');
const router = express.Router();
const {
  getOwnerProperties,
  getPropertyStats,
} = require('../controllers/adminPropertyController');
const {
  createProperty,
  getPropertyForEdit,
  updateProperty,
} = require('../controllers/propertyCreateController');
const { uploadPropertyImage, upload } = require('../controllers/propertyImageController');
const { protect } = require('../middleware/auth');

// Property management
router.get('/properties', protect, getOwnerProperties);
router.get('/properties/:id', protect, getPropertyForEdit);
router.post('/properties', protect, createProperty);
router.put('/properties/:id', protect, updateProperty);
router.get('/properties/:id/stats', protect, getPropertyStats);

// Image upload
router.post('/properties/:id/upload-image', protect, upload.single('file'), uploadPropertyImage);

module.exports = router;