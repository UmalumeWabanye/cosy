const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, adminOrLandlord } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/', protect, adminOrLandlord, getAllRequests);
router.patch('/:id/status', protect, adminOrLandlord, updateRequestStatus);

module.exports = router;
