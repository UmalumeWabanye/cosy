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

// Review routes
const { addReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController');

// Get reviews for a property
router.get('/:id/reviews', getReviews);

// Add review (protected - students only)
router.post('/:id/reviews', protect, addReview);

// Update review (protected - student who posted it)
router.patch('/:id/reviews/:reviewId', protect, updateReview);

// Delete review (protected - student who posted it)
router.delete('/:id/reviews/:reviewId', protect, deleteReview);
