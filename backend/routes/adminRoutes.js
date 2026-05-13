const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
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

// All routes require auth + admin role
router.use(protect, adminOnly);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

router.get('/reports', getReports);
router.get('/reports/collection', getCollectionReport);

router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllRead);
router.patch('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
