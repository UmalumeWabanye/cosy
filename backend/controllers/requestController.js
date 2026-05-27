const Request = require('../models/Request');
const Notification = require('../models/Notification');
const Property = require('../models/Property');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const isAdmin = (user) => user?.role === 'admin';
const isLandlord = (user) => user?.role === 'landlord';
const normalizeRoomNumber = (value = '') => String(value).trim();

const sendApprovalRoomMessage = async ({ actorUserId, requestDoc }) => {
  if (!actorUserId || !requestDoc?.student || !requestDoc?.property) return;

  const conversationFilter = {
    participants: { $all: [actorUserId, requestDoc.student], $size: 2 },
    property: requestDoc.property._id || requestDoc.property,
  };

  let conversation = await Conversation.findOne(conversationFilter);
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [actorUserId, requestDoc.student],
      property: requestDoc.property._id || requestDoc.property,
    });
  }

  const roomLabel = normalizeRoomNumber(requestDoc.roomNumber) || 'TBD';
  const propertyName = requestDoc.property?.propertyName || 'your accommodation';
  const messageText = `Your application for ${propertyName} has been approved. Your allocated room number is ${roomLabel}. Please reply here if you need any help with your move-in details.`;

  await Message.create({
    conversation: conversation._id,
    sender: actorUserId,
    text: messageText,
    isReadBy: [actorUserId],
  });

  conversation.lastMessage = messageText;
  conversation.lastMessageAt = new Date();
  await conversation.save();
};

const ensureRequestAccess = async ({ requestId, user }) => {
  const existing = await Request.findById(requestId).populate('property', 'createdBy propertyName');
  if (!existing) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  if (isLandlord(user) && String(existing.property?.createdBy) !== String(user._id)) {
    const error = new Error('Not authorized to manage this request');
    error.statusCode = 403;
    throw error;
  }

  return existing;
};

const syncPropertyAllocation = async ({ requestDoc, status, roomNumber }) => {
  const property = await Property.findById(requestDoc.property).select('roomAllocations');
  if (!property) {
    const error = new Error('Property not found');
    error.statusCode = 404;
    throw error;
  }

  const requestId = String(requestDoc._id);
  const studentId = String(requestDoc.student);
  const nextAllocations = (property.roomAllocations || []).filter((allocation) => {
    const allocationRequestId = allocation.request ? String(allocation.request) : null;
    const allocationStudentId = allocation.student ? String(allocation.student) : null;
    return allocationRequestId !== requestId && allocationStudentId !== studentId;
  });

  if (status === 'approved') {
    const normalized = normalizeRoomNumber(roomNumber || requestDoc.roomNumber);
    if (!normalized) {
      const error = new Error('Room number is required when approving a request');
      error.statusCode = 400;
      throw error;
    }

    const roomTaken = nextAllocations.some(
      (allocation) => normalizeRoomNumber(allocation.roomNumber).toLowerCase() === normalized.toLowerCase()
    );
    if (roomTaken) {
      const error = new Error('Room number is already allocated');
      error.statusCode = 409;
      throw error;
    }

    nextAllocations.push({
      roomNumber: normalized,
      student: requestDoc.student,
      request: requestDoc._id,
      allocatedAt: new Date(),
    });
    property.roomAllocations = nextAllocations;
    await property.save();
    return normalized;
  }

  property.roomAllocations = nextAllocations;
  await property.save();
  return '';
};

// @desc   Create accommodation request
// @route  POST /api/requests
// @access Private/Student
const createRequest = async (req, res, next) => {
  try {
    const { property: propertyId, moveInDate, leaseDuration, fundingType, message } =
      req.body;

    const normalizedFundingType = fundingType === 'Private / Bursary' ? 'Private' : fundingType;

    const request = await Request.create({
      student: req.user._id,
      property: propertyId,
      moveInDate,
      leaseDuration,
      fundingType: normalizedFundingType,
      message,
    });

    await request.populate('property', 'propertyName city');

      // Also notify the landlord of the property
      const property = await Property.findById(request.property).select('createdBy');
      if (property?.createdBy) {
        await Notification.create({
          recipient: property.createdBy,
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
    const filter = {};
    if (isLandlord(req.user)) {
      const ownedPropertyIds = await Property.find({ createdBy: req.user._id }).distinct('_id');
      filter.property = { $in: ownedPropertyIds };
    }

    const requests = await Request.find(filter)
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
    const { status, roomNumber } = req.body;
    const currentRequest = await ensureRequestAccess({ requestId: req.params.id, user: req.user });
    const wasApproved = currentRequest.status === 'approved';

    let nextRoomNumber = currentRequest.roomNumber || '';
    if (status === 'approved' || currentRequest.status === 'approved') {
      nextRoomNumber = await syncPropertyAllocation({
        requestDoc: currentRequest,
        status,
        roomNumber,
      });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, roomNumber: nextRoomNumber },
      { new: true, runValidators: true }
    )
      .populate('student', 'name email')
      .populate('property', 'propertyName city');
    if (!request) {
      const error = new Error('Request not found');
      error.statusCode = 404;
      throw error;
    }

    if (status === 'approved' && !wasApproved) {
      await sendApprovalRoomMessage({
        actorUserId: req.user._id,
        requestDoc: request,
      });
    }

    // Notify admin of status change
    await Notification.create({
      recipient: request.student?._id || null,
      type: 'request_updated',
      title: 'Request Status Updated',
      message: `An accommodation request has been marked as "${status}".`,
      link: `/applications?requestId=${request._id}`,
      refModel: 'Request',
      refId: request._id,
    });

    res.json(request);
  } catch (error) {
    if (error?.statusCode) {
      res.statusCode = error.statusCode;
    }
    next(error);
  }
};

// @desc   Update request details
// @route  PATCH /api/requests/:id
// @access Private/Admin|Landlord
const updateRequestDetails = async (req, res, next) => {
  try {
    const currentRequest = await ensureRequestAccess({ requestId: req.params.id, user: req.user });

    const updates = {};
    const { moveInDate, leaseDuration, fundingType, message, roomNumber } = req.body;

    if (moveInDate !== undefined) updates.moveInDate = moveInDate;
    if (leaseDuration !== undefined) updates.leaseDuration = leaseDuration;
    if (fundingType !== undefined) updates.fundingType = fundingType;
    if (message !== undefined) updates.message = typeof message === 'string' ? message.trim() : message;

    if (roomNumber !== undefined) {
      const normalized = normalizeRoomNumber(roomNumber);
      if (currentRequest.status === 'approved') {
        const syncedRoom = await syncPropertyAllocation({
          requestDoc: currentRequest,
          status: 'approved',
          roomNumber: normalized,
        });
        updates.roomNumber = syncedRoom;
      } else {
        updates.roomNumber = normalized;
      }
    }

    const updated = await Request.findByIdAndUpdate(currentRequest._id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email university course yearOfStudy idNumber avatar fundingType')
      .populate('property', 'propertyName city address images price roomType createdBy');

    res.json({ data: updated });
  } catch (error) {
    if (error?.statusCode) {
      res.statusCode = error.statusCode;
    }
    next(error);
  }
};

// @desc   Delete request
// @route  DELETE /api/requests/:id
// @access Private/Student|Admin|Landlord
const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('property', 'createdBy');
    if (!request) {
      res.statusCode = 404;
      throw new Error('Request not found');
    }

    const isStudentOwner = req.user?.role === 'student' && String(request.student) === String(req.user._id);
    const isPrivileged = isAdmin(req.user) || isLandlord(req.user);

    if (isLandlord(req.user) && String(request.property?.createdBy) !== String(req.user._id)) {
      res.statusCode = 403;
      throw new Error('Not authorized to remove this request');
    }

    if (!isStudentOwner && !isPrivileged) {
      res.statusCode = 403;
      throw new Error('Not authorized to remove this request');
    }

    if (request.status === 'approved') {
      await syncPropertyAllocation({
        requestDoc: request,
        status: 'rejected',
      });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  updateRequestDetails,
  deleteRequest,
};
