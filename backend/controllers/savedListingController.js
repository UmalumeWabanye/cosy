const SavedListing = require('../models/SavedListing');
const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Save a property
// @route   POST /api/saved
// @access  Private
exports.saveProperty = async (req, res, next) => {
  try {
    const { propertyId, notes } = req.body;

    if (!propertyId) {
      return next(new ErrorResponse('Please provide a property ID', 400));
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check if already saved
    let savedListing = await SavedListing.findOne({
      userId: req.user.id,
      propertyId,
    });

    if (savedListing) {
      return next(new ErrorResponse('Property already saved', 400));
    }

    // Create saved listing
    savedListing = await SavedListing.create({
      userId: req.user.id,
      propertyId,
      notes,
    });

    await savedListing.populate('propertyId');

    res.status(201).json({
      success: true,
      message: 'Property saved successfully',
      data: savedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved listings
// @route   GET /api/saved
// @access  Private
exports.getSavedListings = async (req, res, next) => {
  try {
    const savedListings = await SavedListing.find({ userId: req.user.id })
      .populate({
        path: 'propertyId',
        select: 'name description location images minPrice maxPrice amenities NSFASAccredited rating reviewCount availableRooms',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: savedListings.length,
      data: savedListings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved listing
// @route   DELETE /api/saved/:id
// @access  Private
exports.removeSavedListing = async (req, res, next) => {
  try {
    const savedListing = await SavedListing.findById(req.params.id);

    if (!savedListing) {
      return next(new ErrorResponse('Saved listing not found', 404));
    }

    // Check ownership
    if (savedListing.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this listing', 401));
    }

    await SavedListing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Saved listing removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved listing notes
// @route   PATCH /api/saved/:id
// @access  Private
exports.updateSavedListing = async (req, res, next) => {
  try {
    const { notes } = req.body;

    let savedListing = await SavedListing.findById(req.params.id);

    if (!savedListing) {
      return next(new ErrorResponse('Saved listing not found', 404));
    }

    // Check ownership
    if (savedListing.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this listing', 401));
    }

    savedListing = await SavedListing.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true, runValidators: true }
    ).populate('propertyId');

    res.status(200).json({
      success: true,
      message: 'Saved listing updated',
      data: savedListing,
    });
  } catch (error) {
    next(error);
  }
};
