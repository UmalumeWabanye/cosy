const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

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

module.exports = router;
