const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add a review to a property
// @route   POST /api/properties/:id/reviews
// @access  Private (Students)
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return next(new ErrorResponse('Rating must be between 1 and 5', 400));
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check if student already reviewed this property
    const existingReview = property.reviews.find(
      (review) => review.student.toString() === req.user.id
    );

    if (existingReview) {
      return next(new ErrorResponse('You have already reviewed this property', 400));
    }

    // Add review
    property.reviews.push({
      student: req.user.id,
      rating,
      comment,
    });

    // Calculate average rating
    const totalRating = property.reviews.reduce((sum, review) => sum + review.rating, 0);
    property.rating = (totalRating / property.reviews.length).toFixed(1);
    property.reviewCount = property.reviews.length;

    await property.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a property
// @route   GET /api/properties/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('reviews.student', 'name');

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    res.status(200).json({
      success: true,
      rating: property.rating,
      reviewCount: property.reviewCount,
      reviews: property.reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PATCH /api/properties/:id/reviews/:reviewId
// @access  Private (Student who posted review)
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    const review = property.reviews.id(req.params.reviewId);

    if (!review) {
      return next(new ErrorResponse('Review not found', 404));
    }

    // Check ownership
    if (review.student.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this review', 401));
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return next(new ErrorResponse('Rating must be between 1 and 5', 400));
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment;
    }

    // Recalculate average rating
    const totalRating = property.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    property.rating = (totalRating / property.reviews.length).toFixed(1);

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/properties/:id/reviews/:reviewId
// @access  Private (Student who posted review)
exports.deleteReview = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    const review = property.reviews.id(req.params.reviewId);

    if (!review) {
      return next(new ErrorResponse('Review not found', 404));
    }

    // Check ownership
    if (review.student.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this review', 401));
    }

    property.reviews.id(req.params.reviewId).deleteOne();
    property.reviewCount = property.reviews.length;

    if (property.reviews.length > 0) {
      const totalRating = property.reviews.reduce((sum, rev) => sum + rev.rating, 0);
      property.rating = (totalRating / property.reviews.length).toFixed(1);
    } else {
      property.rating = 0;
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
