const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, adminOnly, adminOrLandlord } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');
const {
  getUsers,
  getUser,
  getLandlordOverview,
  getLandlordFilterOptions,
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

// Verify admin portal key server-side before granting dashboard entry
router.post('/access/verify', [
  adminOnly,
  body('accessKey').isString().trim().notEmpty().isLength({ max: 128 }).withMessage('Access key is required'),
  handleValidation,
], (req, res) => {
  const expectedKey = process.env.ADMIN_PORTAL_KEY;

  if (!expectedKey) {
    return res.status(500).json({ message: 'Admin portal key is not configured on the server' });
  }

  if (req.body.accessKey !== expectedKey) {
    return res.status(403).json({ message: 'Invalid admin access key' });
  }

  return res.json({ success: true });
});

// Admin-only management routes
router.use('/users', adminOnly);
router.get('/users', getUsers);
router.get('/users/landlord-filter-options', getLandlordFilterOptions);
router.get('/users/:id/overview', getLandlordOverview);
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
