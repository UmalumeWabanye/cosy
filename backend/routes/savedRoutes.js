const express = require('express');
const { protect } = require('../middleware/auth');
const SavedListing = require('../models/SavedListing');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const data = await SavedListing.find({ student: req.user._id })
      .populate('propertyId', 'propertyName city address universityNearby price roomType images nsfasAccredited')
      .sort({ createdAt: -1 });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load saved listings' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, notes = '' } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'propertyId is required' });

    const existing = await SavedListing.findOne({ student: req.user._id, propertyId });
    if (existing) return res.status(200).json({ data: existing, message: 'Already saved' });

    const saved = await SavedListing.create({ student: req.user._id, propertyId, notes });
    const populated = await saved.populate('propertyId', 'propertyName city address universityNearby price roomType images nsfasAccredited');
    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to save listing' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const { notes = '' } = req.body;
    const updated = await SavedListing.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      { notes },
      { new: true, runValidators: true }
    ).populate('propertyId', 'propertyName city address universityNearby price roomType images nsfasAccredited');

    if (!updated) return res.status(404).json({ message: 'Saved listing not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update notes' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await SavedListing.findOne({ _id: req.params.id, student: req.user._id });
    if (!listing) {
      const byProperty = await SavedListing.findOneAndDelete({ student: req.user._id, propertyId: req.params.id });
      if (!byProperty) return res.status(404).json({ message: 'Saved listing not found' });
      return res.json({ message: 'Removed from saved listings' });
    }

    await listing.deleteOne();
    res.json({ message: 'Removed from saved listings' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to remove saved listing' });
  }
});

module.exports = router;
