const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');
const Review = require('../models/Review');
const Request = require('../models/Request');

const router = express.Router();

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Submit a review. Student must have an approved request for the property
// whose lease has already ended.
router.post(
  '/',
  protect,
  [
    body('propertyId').isMongoId().withMessage('Invalid property ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can leave reviews' });
      }

      const { propertyId, rating, comment } = req.body;

      // Find an approved request for this student + property
      const approvedRequest = await Request.findOne({
        student: req.user._id,
        property: propertyId,
        status: 'approved',
      });

      if (!approvedRequest) {
        return res.status(403).json({ message: 'You can only review properties where your application was approved' });
      }

      // Check lease has ended
      const moveIn = new Date(approvedRequest.moveInDate);
      const leaseEnd = new Date(moveIn);
      leaseEnd.setMonth(leaseEnd.getMonth() + Number(approvedRequest.leaseDuration));

      if (leaseEnd > new Date()) {
        return res.status(403).json({
          message: 'You can only leave a review after your lease has ended',
          leaseEndsAt: leaseEnd.toISOString(),
        });
      }

      // Create (will fail with 11000 if duplicate)
      const review = await Review.create({
        student: req.user._id,
        property: propertyId,
        rating: Number(rating),
        comment: comment?.trim() || undefined,
      });

      await review.populate('student', 'name');

      return res.status(201).json({ message: 'Review submitted successfully', data: review });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You have already reviewed this property' });
      }
      return res.status(500).json({ message: 'Failed to submit review' });
    }
  }
);

// ─── GET /api/reviews/property/:propertyId ────────────────────────────────────
// Public — returns all reviews for a property with avg rating + count
router.get(
  '/property/:propertyId',
  [param('propertyId').isMongoId().withMessage('Invalid property ID')],
  handleValidation,
  async (req, res) => {
    try {
      const reviews = await Review.find({ property: req.params.propertyId })
        .populate('student', 'name')
        .sort({ createdAt: -1 });

      const total = reviews.length;
      const avgRating = total > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
        : null;

      return res.json({ data: reviews, total, avgRating });
    } catch {
      return res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  }
);

// ─── GET /api/reviews/eligible ────────────────────────────────────────────────
// Protected — returns the set of propertyIds the authenticated student is
// eligible to review (approved + expired lease) and which they have already reviewed.
router.get('/eligible', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.json({ eligible: [], reviewed: [] });

    const now = new Date();

    const approved = await Request.find({
      student: req.user._id,
      status: 'approved',
    }).select('property moveInDate leaseDuration');

    const eligible = approved
      .filter((r) => {
        const end = new Date(r.moveInDate);
        end.setMonth(end.getMonth() + Number(r.leaseDuration));
        return end <= now;
      })
      .map((r) => r.property.toString());

    const alreadyReviewed = await Review.find({
      student: req.user._id,
      property: { $in: eligible },
    }).select('property');

    const reviewed = alreadyReviewed.map((r) => r.property.toString());

    return res.json({ eligible, reviewed });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch eligibility' });
  }
});

module.exports = router;
