const express = require('express');
const { protect, adminOrLandlord } = require('../middleware/auth');
const Viewing = require('../models/Viewing');
const Property = require('../models/Property');

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

    const populated = await viewing
      .populate('student', 'name email university course avatar')
      .populate('property', 'propertyName city address images price roomType createdBy');

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
