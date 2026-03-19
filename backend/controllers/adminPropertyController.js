const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get owner's properties
// @route   GET /api/admin/properties
// @access  Private
exports.getOwnerProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find({ owner: req.user.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Property.countDocuments({ owner: req.user.id });

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get property statistics
// @route   GET /api/admin/properties/:id/stats
// @access  Private
exports.getPropertyStats = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    const Request = require('../models/Request');
    const stats = {
      totalRequests: await Request.countDocuments({ propertyId: property._id }),
      pendingRequests: await Request.countDocuments({
        propertyId: property._id,
        status: 'pending',
      }),
      approvedRequests: await Request.countDocuments({
        propertyId: property._id,
        status: 'approved',
      }),
      rejectedRequests: await Request.countDocuments({
        propertyId: property._id,
        status: 'rejected',
      }),
    };

    res.status(200).json({
      success: true,
      data: { property, stats },
    });
  } catch (error) {
    next(error);
  }
};