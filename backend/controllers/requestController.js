const Request = require('../models/Request');
const Notification = require('../models/Notification');

// @desc   Create accommodation request
// @route  POST /api/requests
// @access Private/Student
const createRequest = async (req, res, next) => {
  try {
    const { property, moveInDate, leaseDuration, fundingType, message } =
      req.body;

    const normalizedFundingType = fundingType === 'Private / Bursary' ? 'Private' : fundingType;

    const request = await Request.create({
      student: req.user._id,
      property,
      moveInDate,
      leaseDuration,
      fundingType: normalizedFundingType,
      message,
    });

    await request.populate('property', 'propertyName city');

    // Notify all admins of new request
    await Notification.create({
      type: 'new_request',
      title: 'New Accommodation Request',
      message: `A student submitted a new request for ${request.property?.propertyName ?? 'a property'}.`,
      link: `/admin/requests`,
      refModel: 'Request',
      refId: request._id,
    });

    res.status(201).json({ data: request });
  } catch (error) {
    next(error);
  }
};

// @desc   Get requests for current student
// @route  GET /api/requests/my
// @access Private/Student
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ student: req.user._id })
      .populate('property', 'propertyName city address images price roomType')
      .sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all requests (admin)
// @route  GET /api/requests
// @access Private/Admin
const getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find()
      .populate('student', 'name email university fundingType')
      .populate('property', 'propertyName city address images price roomType')
      .sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Update request status
// @route  PATCH /api/requests/:id/status
// @access Private/Admin
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!request) {
      res.statusCode = 404;
      throw new Error('Request not found');
    }

    // Notify admin of status change
    await Notification.create({
      type: 'request_updated',
      title: 'Request Status Updated',
      message: `An accommodation request has been marked as "${status}".`,
      link: `/admin/requests`,
      refModel: 'Request',
      refId: request._id,
    });

    res.json(request);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
};
