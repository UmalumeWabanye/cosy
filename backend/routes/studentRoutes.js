const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Property = require('../models/Property');
const SavedSearch = require('../models/SavedSearch');

const router = express.Router();

const buildSavedSearchFilter = (filters = {}) => {
  const query = {};
  if (filters.city) query.city = new RegExp(filters.city, 'i');
  if (filters.university) query.universityNearby = new RegExp(filters.university, 'i');
  if (filters.search) {
    query.$or = [
      { propertyName: new RegExp(filters.search, 'i') },
      { city: new RegExp(filters.search, 'i') },
      { address: new RegExp(filters.search, 'i') },
      { universityNearby: new RegExp(filters.search, 'i') },
    ];
  }
  if (filters.roomType) query.roomType = new RegExp(`^${filters.roomType}$`, 'i');
  if (filters.nsfas) query.nsfasAccredited = true;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      query.price.$lte = Number(filters.maxPrice);
    }
    if (!Object.keys(query.price).length) delete query.price;
  }

  return query;
};

// GET /api/student/saved-searches
router.get('/saved-searches', protect, async (req, res) => {
  try {
    const data = await SavedSearch.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load saved searches' });
  }
});

// POST /api/student/saved-searches
router.post('/saved-searches', protect, async (req, res) => {
  try {
    const { name, filters } = req.body || {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Search name is required' });
    }

    const saved = await SavedSearch.create({
      student: req.user._id,
      name: name.trim(),
      filters: {
        search: filters?.search || '',
        city: filters?.city || '',
        university: filters?.university || '',
        minPrice: filters?.minPrice ?? null,
        maxPrice: filters?.maxPrice ?? null,
        roomType: filters?.roomType || '',
        nsfas: Boolean(filters?.nsfas),
      },
    });

    res.status(201).json({ data: saved });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'You already have a saved search with that name' });
    }
    res.status(500).json({ message: err.message || 'Failed to save search' });
  }
});

// DELETE /api/student/saved-searches/:id
router.delete('/saved-searches/:id', protect, async (req, res) => {
  try {
    const deleted = await SavedSearch.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Saved search not found' });
    res.json({ message: 'Saved search deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete saved search' });
  }
});

// POST /api/student/saved-searches/alerts/run
router.post('/saved-searches/alerts/run', protect, async (req, res) => {
  try {
    const searches = await SavedSearch.find({ student: req.user._id }).lean();
    let alertsCreated = 0;

    for (const search of searches) {
      const matchCount = await Property.countDocuments(buildSavedSearchFilter(search.filters));
      const isIncrease = matchCount > Number(search.lastMatchedCount || 0);

      if (isIncrease) {
        await Notification.create({
          recipient: req.user._id,
          type: 'request_updated',
          title: 'Saved Search Update',
          message: `${search.name}: ${matchCount} matching properties are currently available.`,
          link: '/browse',
          refModel: 'User',
          refId: req.user._id,
        });
        alertsCreated += 1;
      }

      await SavedSearch.updateOne(
        { _id: search._id },
        { $set: { lastMatchedCount: matchCount, lastAlertSentAt: new Date() } }
      );
    }

    res.json({ success: true, alertsCreated, totalSearches: searches.length });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to run saved-search alerts' });
  }
});

// GET /api/student/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const { limit = 20, page = 1, unread } = req.query;
    const filter = { recipient: req.user._id };
    if (unread === 'true') filter.isRead = false;

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const data = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ data, total, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/student/notifications/:id/read
router.patch('/notifications/:id/read', protect, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Not found' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/student/notifications/read-all
router.patch('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/student/notifications/:id
router.delete('/notifications/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/student/roommates
router.get('/roommates', protect, async (req, res) => {
  try {
    const { search = '', fundingType, yearOfStudy, limit = 24 } = req.query;

    const baseFilter = {
      role: 'student',
      _id: { $ne: req.user._id },
      profileComplete: true,
    };

    if (fundingType) baseFilter.fundingType = fundingType;
    if (yearOfStudy) baseFilter.yearOfStudy = yearOfStudy;
    if (search) {
      baseFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
      ];
    }

    const peers = await User.find(baseFilter)
      .select('name email avatar university course yearOfStudy fundingType isVerified profileComplete')
      .limit(Number(limit) * 2)
      .lean();

    const current = req.user;
    const scored = peers.map((peer) => {
      let score = 0;
      if (current.university && peer.university && current.university === peer.university) score += 40;
      if (current.course && peer.course && current.course === peer.course) score += 30;
      if (current.fundingType && peer.fundingType && current.fundingType === peer.fundingType) score += 20;
      if (current.yearOfStudy && peer.yearOfStudy && current.yearOfStudy === peer.yearOfStudy) score += 10;
      return { ...peer, matchScore: score };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name));

    res.json({ data: scored.slice(0, Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
