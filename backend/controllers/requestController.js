const Request = require('../models/Request');
const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
  try {
    const { propertyId, moveInDate, leaseDuration, fundingType, message } = req.body;

    // Validation
    if (!propertyId || !moveInDate || !leaseDuration || !fundingType) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Create request
    const request = await Request.create({
      userId: req.user.id,
      propertyId,
      moveInDate,
      leaseDuration,
      fundingType,
      message,
    });

    await request.populate('propertyId', 'name location minPrice');
    await request.populate('userId', 'name email university');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's requests
// @route   GET /api/requests/my
// @access  Private
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ userId: req.user.id })
      .populate('propertyId', 'name location minPrice images')
      .populate('userId', 'name email university')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (admin)
// @route   GET /api/requests
// @access  Private/Admin
exports.getAllRequests = async (req, res, next) => {
  try {
    const { propertyId, status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const requests = await Request.find(filter)
      .populate('propertyId', 'name location minPrice')
      .populate('userId', 'name email university fundingType')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Request.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Please provide a valid status', 400));
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('propertyId').populate('userId', 'name email');

    if (!request) {
      return next(new ErrorResponse('Request not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Request status updated',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};