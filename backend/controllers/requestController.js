const Request = require('../models/Request');
const Notification = require('../models/Notification');
const Property = require('../models/Property');

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
      link: `/admin/requests?requestId=${request._id}`,
      refModel: 'Request',
      refId: request._id,
    });

      // Also notify the landlord of the property
      const propertyDoc = await Property.findById(request.property).select('createdBy');
      if (propertyDoc?.createdBy) {
        await Notification.create({
          recipient: propertyDoc.createdBy,
          type: 'new_request',
          title: 'New Accommodation Request',
          message: `A student submitted a new request for ${request.property?.propertyName ?? 'your property'}.`,
          link: `/landlord/requests?requestId=${request._id}`,
          refModel: 'Request',
          refId: request._id,
        });
      }

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

// @desc   Get all requests for the landlord management platform
// @route  GET /api/requests
// @access Private/Admin
const getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({})
      .populate('student', 'name email university course yearOfStudy idNumber avatar fundingType')
      .populate('property', 'propertyName city address images price roomType createdBy')
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
    const currentRequest = await Request.findById(req.params.id).populate('property', 'createdBy');
    if (!currentRequest) {
      res.statusCode = 404;
      throw new Error('Request not found');
    }

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
      link: req.user.role === 'landlord'
        ? `/landlord/requests?requestId=${request._id}`
        : `/admin/requests?requestId=${request._id}`,
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
