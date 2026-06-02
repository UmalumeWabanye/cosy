const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');
const Maintenance = require('../models/Maintenance');
const Request = require('../models/Request');
const Property = require('../models/Property');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const CATEGORIES = Maintenance.schema.path('category').enumValues;

// ─── POST /api/maintenance ────────────────────────────────────────────────────
// Student submits a maintenance request. Must have an approved request for the
// property and must have already moved in.
router.post(
  '/',
  protect,
  [
    body('propertyId').isMongoId().withMessage('Invalid property ID'),
    body('category').isIn(CATEGORIES).withMessage('Invalid category'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10–1000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('attachments').optional().isArray({ max: 4 }).withMessage('Attachments must be an array of up to 4 items'),
    body('attachments.*.url').optional().isURL().withMessage('Invalid attachment URL'),
    body('attachments.*.filename').optional().isString().trim().isLength({ max: 200 }).withMessage('Invalid attachment filename'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can submit maintenance requests' });
      }

      const { propertyId, category, description, priority } = req.body;

      // Must have an approved request for this property and have moved in
      const approvedReq = await Request.findOne({
        student: req.user._id,
        property: propertyId,
        status: 'approved',
        moveInDate: { $lte: new Date() },
      });

      if (!approvedReq) {
        return res.status(403).json({
          message: 'You can only submit maintenance requests for properties you are currently living in',
        });
      }

      const property = await Property.findById(propertyId).select('createdBy');
      if (!property) return res.status(404).json({ message: 'Property not found' });

      let roomNumber = (approvedReq.roomNumber || '').trim();
      if (!roomNumber) {
        const propertyWithAllocations = await Property.findById(propertyId).select('roomAllocations');
        const allocation = propertyWithAllocations?.roomAllocations?.find((item) => {
          const allocationRequestId = item.request ? String(item.request) : null;
          const allocationStudentId = item.student ? String(item.student) : null;
          return allocationRequestId === String(approvedReq._id) || allocationStudentId === String(req.user._id);
        });
        roomNumber = (allocation?.roomNumber || '').trim();
      }

      if (!roomNumber) {
        return res.status(403).json({
          message: 'Maintenance requests are only available after your room has been assigned',
        });
      }

      const ticket = await Maintenance.create({
        student: req.user._id,
        property: propertyId,
        roomNumber,
        landlord: property.createdBy,
        category,
        description: description.trim(),
        priority: priority || 'medium',
        attachments: Array.isArray(req.body.attachments)
          ? req.body.attachments.filter((item) => item?.url).map((item) => ({ url: item.url, filename: item.filename || '' }))
          : [],
      });

      await ticket.populate([
        { path: 'property', select: 'propertyName city' },
        { path: 'landlord', select: 'name email' },
      ]);

      return res.status(201).json({ message: 'Maintenance request submitted', data: ticket });
    } catch {
      return res.status(500).json({ message: 'Failed to submit maintenance request' });
    }
  }
);

// ─── GET /api/maintenance/my ──────────────────────────────────────────────────
// Student retrieves all their own maintenance requests
router.get('/my', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Students only' });
    }

    const tickets = await Maintenance.find({ student: req.user._id })
      .populate('property', 'propertyName city address')
      .sort({ createdAt: -1 });

    return res.json({ data: tickets });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch maintenance requests' });
  }
});

// ─── GET /api/maintenance/active-properties ───────────────────────────────────
// Student — returns the propertyIds they are currently living in (for the submit form)
router.get('/active-properties', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.json({ data: [] });

    const now = new Date();
    const approved = await Request.find({
      student: req.user._id,
      status: 'approved',
      moveInDate: { $lte: now },
    })
      .populate('property', 'propertyName city address roomAllocations')
      .sort({ moveInDate: -1 });

    // Filter to leases that haven't ended yet (or have no clear end)
    const active = approved.filter((r) => {
      if (!r.leaseDuration) return true;
      const end = new Date(r.moveInDate);
      end.setMonth(end.getMonth() + Number(r.leaseDuration));
      return end >= now;
    });

    const data = active.map((r) => {
      let roomNumber = (r.roomNumber || '').trim();
      if (!roomNumber && r.property?.roomAllocations?.length) {
        const allocation = r.property.roomAllocations.find((item) => {
          const allocationRequestId = item.request ? String(item.request) : null;
          const allocationStudentId = item.student ? String(item.student) : null;
          return allocationRequestId === String(r._id) || allocationStudentId === String(req.user._id);
        });
        roomNumber = (allocation?.roomNumber || '').trim();
      }

      return {
        request: r._id,
        property: r.property,
        moveInDate: r.moveInDate,
        roomNumber,
      };
    }).filter((item) => item.property && item.roomNumber);

    return res.json({ data });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch active properties' });
  }
});

// ─── POST /api/maintenance/upload-image ─────────────────────────────────────────────────
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cosy/maintenance', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ imageUrl: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('Maintenance image upload error:', err);
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

// ─── GET /api/maintenance/landlord ───────────────────────────────────────────
// Landlord retrieves all maintenance requests for their properties
router.get('/landlord', protect, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: 'Landlords only' });
    }

    const { status, propertyId, roomNumber, priority } = req.query;
    const filter = { landlord: req.user._id };
    if (typeof status === 'string' && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      filter.status = status;
    }
    if (typeof propertyId === 'string' && propertyId.trim()) {
      filter.property = propertyId.trim();
    }
    if (typeof roomNumber === 'string' && roomNumber.trim()) {
      filter.roomNumber = new RegExp(`^${roomNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (typeof priority === 'string' && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      filter.priority = priority;
    }

    const tickets = await Maintenance.find(filter)
      .populate('student', 'name email')
      .populate('property', 'propertyName city address')
      .sort({ createdAt: -1 });

    const openCount = tickets.filter((t) => t.status === 'open').length;
    const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;

    return res.json({ data: tickets, openCount, inProgressCount });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch maintenance requests' });
  }
});

// ─── PATCH /api/maintenance/:id ───────────────────────────────────────────────
// Landlord updates status, expectedDate, and/or note
router.patch(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid maintenance ID'),
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
    body('expectedDate').optional().isISO8601().withMessage('Invalid date format'),
    body('landlordNote').optional().isString().trim().isLength({ max: 500 }).withMessage('Note too long'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      if (req.user.role !== 'landlord') {
        return res.status(403).json({ message: 'Landlords only' });
      }

      const ticket = await Maintenance.findOne({ _id: req.params.id, landlord: req.user._id });
      if (!ticket) return res.status(404).json({ message: 'Maintenance request not found' });

      const { status, expectedDate, landlordNote } = req.body;
      const hasResponseUpdate =
        (status !== undefined && status !== ticket.status && status !== 'open') ||
        expectedDate !== undefined ||
        (landlordNote !== undefined && landlordNote.trim());

      if (status !== undefined) ticket.status = status;
      if (expectedDate !== undefined) ticket.expectedDate = new Date(expectedDate);
      if (landlordNote !== undefined) ticket.landlordNote = landlordNote.trim() || undefined;
      if (hasResponseUpdate && !ticket.acknowledgedAt) {
        ticket.acknowledgedAt = new Date();
      }

      await ticket.save();
      await ticket.populate([
        { path: 'student', select: 'name email' },
        { path: 'property', select: 'propertyName city' },
      ]);

      return res.json({ message: 'Maintenance request updated', data: ticket });
    } catch {
      return res.status(500).json({ message: 'Failed to update maintenance request' });
    }
  }
);

// ─── POST /api/maintenance/:id/comment ───────────────────────────────────────────
router.post(
  '/:id/comment',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid maintenance ID'),
    body('message').trim().isLength({ min: 2, max: 1000 }).withMessage('Message must be 2–1000 characters'),
    body('attachments').optional().isArray({ max: 4 }).withMessage('Attachments must be an array of up to 4 items'),
    body('attachments.*.url').optional().isURL().withMessage('Invalid attachment URL'),
    body('attachments.*.filename').optional().isString().trim().isLength({ max: 200 }).withMessage('Invalid attachment filename'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const ticket = await Maintenance.findById(req.params.id);
      if (!ticket) return res.status(404).json({ message: 'Maintenance request not found' });

      const isStudent = req.user.role === 'student' && String(ticket.student) === String(req.user._id);
      const isLandlord = req.user.role === 'landlord' && String(ticket.landlord) === String(req.user._id);
      if (!isStudent && !isLandlord) {
        return res.status(403).json({ message: 'Not authorized to comment on this maintenance request' });
      }

      if (ticket.status === 'closed') {
        return res.status(400).json({ message: 'Closed maintenance requests cannot receive new comments' });
      }

      const { message, attachments } = req.body;
      const comment = {
        sender: isLandlord ? 'landlord' : 'student',
        message: message.trim(),
        attachments: Array.isArray(attachments)
          ? attachments.filter((item) => item?.url).map((item) => ({ url: item.url, filename: item.filename || '' }))
          : [],
      };

      ticket.conversation = ticket.conversation || [];
      ticket.conversation.push(comment);
      await ticket.save();

      return res.json({ message: 'Comment added', data: ticket });
    } catch {
      return res.status(500).json({ message: 'Failed to add comment' });
    }
  }
);

// ─── POST /api/maintenance/:id/rating ───────────────────────────────────────────
router.post(
  '/:id/rating',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid maintenance ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const ticket = await Maintenance.findById(req.params.id);
      if (!ticket) return res.status(404).json({ message: 'Maintenance request not found' });
      if (req.user.role !== 'student' || String(ticket.student) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to rate this maintenance request' });
      }
      if (!['resolved', 'closed'].includes(ticket.status)) {
        return res.status(400).json({ message: 'You can only rate a maintenance request after it has been completed' });
      }
      if (ticket.rating) {
        return res.status(400).json({ message: 'This maintenance request has already been rated' });
      }

      ticket.rating = Number(req.body.rating);
      ticket.ratingComment = req.body.comment?.trim() || undefined;
      ticket.ratedAt = new Date();
      await ticket.save();

      return res.json({ message: 'Thank you for your feedback', data: ticket });
    } catch {
      return res.status(500).json({ message: 'Failed to submit rating' });
    }
  }
);

// ─── DELETE /api/maintenance/:id ─────────────────────────────────────────────
// Student cancels an open request they submitted
router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid maintenance ID')],
  handleValidation,
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Students only' });
      }

      const ticket = await Maintenance.findOne({ _id: req.params.id, student: req.user._id });
      if (!ticket) return res.status(404).json({ message: 'Maintenance request not found' });
      if (ticket.status !== 'open') {
        return res.status(400).json({ message: 'Only open requests can be cancelled' });
      }

      await ticket.deleteOne();
      return res.json({ message: 'Maintenance request cancelled' });
    } catch {
      return res.status(500).json({ message: 'Failed to cancel maintenance request' });
    }
  }
);

// ─── GET /api/maintenance/categories ─────────────────────────────────────────
router.get('/categories', (_req, res) => {
  res.json({ data: CATEGORIES });
});

module.exports = router;
