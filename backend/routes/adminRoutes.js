const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrLandlord } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  toggleUser,
  deleteUser,
  getReports,
  getCollectionReport,
} = require('../controllers/adminController');
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Admin-only management routes
router.use('/users', adminOnly);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

router.use('/reports', adminOnly);
router.get('/reports', getReports);
router.get('/reports/collection', getCollectionReport);

// Notifications are available to admins and landlords
router.use('/notifications', adminOrLandlord);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllRead);
router.patch('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
