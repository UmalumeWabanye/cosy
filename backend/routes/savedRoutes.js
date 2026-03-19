const express = require('express');
const router = express.Router();
const {
  saveProperty,
  getSavedListings,
  removeSavedListing,
  updateSavedListing,
} = require('../controllers/savedListingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saveProperty);
router.get('/', protect, getSavedListings);
router.delete('/:id', protect, removeSavedListing);
router.patch('/:id', protect, updateSavedListing);

module.exports = router;
