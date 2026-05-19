const express = require('express');
const { protect, adminOrLandlord } = require('../middleware/auth');
const Viewing = require('../models/Viewing');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { property, requestedDate, note = '' } = req.body;
    if (!property || !requestedDate) {
      return res.status(400).json({ message: 'property and requestedDate are required' });
    }

    const viewing = await Viewing.create({
      student: req.user._id,
      property,
      requestedDate,
      note,
    });

    const populated = await viewing.populate([
      { path: 'student', select: 'name email university course avatar' },
      { path: 'property', select: 'propertyName city address images price roomType createdBy' },
    ]);

    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to book viewing' });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const data = await Viewing.find({ student: req.user._id })
      .populate('property', 'propertyName city address images price roomType createdBy')
      .sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load viewings' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const viewing = await Viewing.findOne({ _id: req.params.id, student: req.user._id })
      .populate('property', 'propertyName createdBy');

    if (!viewing) {
      return res.status(404).json({ message: 'Viewing not found' });
    }

    const landlordId = viewing.property?.createdBy;
    if (landlordId) {
      await Notification.create({
        recipient: landlordId,
        type: 'request_updated',
        title: 'Viewing Booking Cancelled',
        message: `${req.user.name || 'A student'} cancelled a viewing for ${viewing.property?.propertyName || 'your property'}.`,
        link: '/notifications',
        refModel: null,
        refId: null,
      });
    }

    await viewing.deleteOne();
    res.json({ message: 'Viewing booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to cancel viewing' });
  }
});

router.get('/', protect, adminOrLandlord, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'landlord') {
      const myProperties = await Property.find({ createdBy: req.user._id }).select('_id');
      const myPropertyIds = myProperties.map((property) => property._id);
      filter = { property: { $in: myPropertyIds } };
    }

    const data = await Viewing.find(filter)
      .populate('student', 'name email university course avatar')
      .populate('property', 'propertyName city address images price roomType createdBy')
      .sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load viewings' });
  }
});

router.patch('/:id/status', protect, adminOrLandlord, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const currentViewing = await Viewing.findById(req.params.id).populate('property', 'createdBy');
    if (!currentViewing) {
      return res.status(404).json({ message: 'Viewing not found' });
    }

    if (
      req.user.role === 'landlord' &&
      String(currentViewing.property?.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not allowed to update this viewing' });
    }

    const updated = await Viewing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('student', 'name email university course avatar')
      .populate('property', 'propertyName city address images price roomType createdBy');

    if (!updated) return res.status(404).json({ message: 'Viewing not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update viewing status' });
  }
});

module.exports = router;
