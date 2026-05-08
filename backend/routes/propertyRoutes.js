const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, adminOnly } = require('../middleware/auth');

// Only admins should be able to list properties under the admin-prefixed mount
router.get('/', protect, adminOnly, getProperties);
router.get('/:id', getProperty);
router.post('/', protect, adminOnly, createProperty);
router.put('/:id', protect, adminOnly, updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);

module.exports = router;
