const Notification = require('../models/Notification');

const notificationScopeFilter = (user) => {
  if (user?.role === 'landlord') {
    return { recipient: user._id };
  }
  return { recipient: null };
};

// @desc   Get all notifications (admin)
// @route  GET /api/admin/notifications
// @access Admin
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, unread } = req.query;
    const filter = notificationScopeFilter(req.user);

    if (unread === 'true') filter.isRead = false;

    const total = await Notification.countDocuments(filter);
    const unreadFilter = { ...filter, isRead: false };
    const unreadCount = await Notification.countDocuments(unreadFilter);
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
    const scopeFilter = notificationScopeFilter(req.user);
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...scopeFilter },
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
    const scopeFilter = notificationScopeFilter(req.user);
    await Notification.updateMany({ ...scopeFilter, isRead: false }, { isRead: true });
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
    const scopeFilter = notificationScopeFilter(req.user);
    await Notification.findOneAndDelete({ _id: req.params.id, ...scopeFilter });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
