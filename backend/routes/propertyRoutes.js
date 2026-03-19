const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyForEdit,
  getAdminProperties,
  togglePublish,
} = require('../controllers/propertyController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getProperties);
router.get('/:id', getProperty);

// Private/Admin routes
router.post('/', protect, adminOnly, createProperty);
router.get('/admin/list', protect, adminOnly, getAdminProperties);
router.get('/admin/:id', protect, adminOnly, getPropertyForEdit);
router.put('/:id', protect, adminOnly, updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);
router.patch('/:id/publish', protect, adminOnly, togglePublish);

module.exports = router;
