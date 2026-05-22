const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  updateRequestDetails,
  deleteRequest,
} = require('../controllers/requestController');
const { protect, adminOrLandlord } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/', protect, adminOrLandlord, getAllRequests);
router.patch(
  '/:id/status',
  protect,
  adminOrLandlord,
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('status').isIn(['approved', 'rejected']).withMessage('Invalid request status'),
    body('roomNumber')
      .if(body('status').equals('approved'))
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Room number is required when approving a request'),
  ],
  handleValidation,
  updateRequestStatus
);
router.patch(
  '/:id',
  protect,
  adminOrLandlord,
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('moveInDate').optional().isISO8601().withMessage('Invalid move-in date'),
    body('leaseDuration').optional().isInt({ min: 1, max: 36 }).withMessage('Lease duration must be between 1 and 36 months'),
    body('fundingType').optional().isIn(['NSFAS', 'Private', 'Self-funded']).withMessage('Invalid funding type'),
    body('message').optional().isString().trim().isLength({ max: 1000 }).withMessage('Message must be under 1000 characters'),
    body('roomNumber').optional().isString().trim().isLength({ min: 1, max: 20 }).withMessage('Room number must be between 1 and 20 characters'),
  ],
  handleValidation,
  updateRequestDetails
);
router.delete('/:id', protect, [param('id').isMongoId().withMessage('Invalid request ID')], handleValidation, deleteRequest);

module.exports = router;
