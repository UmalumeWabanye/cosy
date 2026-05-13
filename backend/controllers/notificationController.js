const Notification = require('../models/Notification');

// @desc   Get all notifications (admin)
// @route  GET /api/admin/notifications
// @access Admin
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, unread } = req.query;
    const filter = {};
    if (unread === 'true') filter.isRead = false;

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: notifications, total, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @desc   Mark a single notification as read
// @route  PATCH /api/admin/notifications/:id/read
// @access Admin
const markRead = async (req, res, next) => {
  try {
    const n = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json({ data: n });
  } catch (err) {
    next(err);
  }
};

// @desc   Mark all notifications as read
// @route  PATCH /api/admin/notifications/read-all
// @access Admin
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a notification
// @route  DELETE /api/admin/notifications/:id
// @access Admin
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
